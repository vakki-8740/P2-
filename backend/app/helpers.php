<?php
/**
 * app/helpers.php — request helpers, client identity, crypto, uploads,
 * response normalisation and rate limiting.
 */

declare(strict_types=1);

/* ------------------------------------------------------------------ */
/* Responses                                                          */
/* ------------------------------------------------------------------ */

function json_response($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_ok($data = null, int $code = 200): void
{
    json_response(['ok' => true, 'data' => $data], $code);
}

function json_error(string $message, int $code = 400, array $extra = []): void
{
    json_response(array_merge(['ok' => false, 'error' => $message], $extra), $code);
}

/** Read the JSON request body (also tolerates form-encoded bodies). */
function request_body(): array
{
    static $cached = null;
    if (is_array($cached)) {
        return $cached;
    }

    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if (MAX_REQUEST_BYTES > 0 && $contentLength > MAX_REQUEST_BYTES) {
        json_error('Request too large', 413, ['max_bytes' => MAX_REQUEST_BYTES]);
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        $cached = $_POST ?: [];
        return $cached;
    }

    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $cached = $decoded;
        return $cached;
    }

    // Not JSON — fall back to form fields when present.
    $cached = $_POST ?: [];
    return $cached;
}

function query_str(string $key, string $default = ''): string
{
    $value = $_GET[$key] ?? $default;
    return is_string($value) ? trim($value) : $default;
}

function query_int(string $key, int $default, int $min, int $max): int
{
    $value = $_GET[$key] ?? null;
    if (!is_numeric($value)) {
        return $default;
    }
    return max($min, min($max, (int) $value));
}

/* ------------------------------------------------------------------ */
/* Request identity                                                   */
/* ------------------------------------------------------------------ */

/**
 * Per-browser id. Sent by the frontend as X-Client-Id (or ?client= for
 * plain GETs such as <img> sources). Complaints and chat messages are
 * scoped to this id so nobody can read another visitor's data.
 */
function client_id(): string
{
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $raw = $_SERVER['HTTP_X_CLIENT_ID'] ?? query_str('client');
    $raw = is_string($raw) ? trim($raw) : '';

    // Accept UUID / hex-ish ids only, 8..64 chars.
    if (preg_match('/^[A-Za-z0-9._-]{8,64}$/', $raw)) {
        $cached = $raw;
        return $cached;
    }

    $cached = '';
    return $cached;
}

function require_client_id(): string
{
    $id = client_id();
    if ($id === '') {
        json_error('Missing X-Client-Id header', 400);
    }
    return $id;
}

function admin_token(): string
{
    return (string) env_str('ADMIN_API_TOKEN', '');
}

/** True when the caller presented a valid admin API token (owner/agent access). */
function is_admin_request(): bool
{
    $expected = admin_token();
    if ($expected === '') {
        return false;
    }
    $given = (string) ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? query_str('admin_token'));
    return $given !== '' && hash_equals($expected, $given);
}

function require_admin(): void
{
    if (!is_admin_request()) {
        json_error('Admin token required', 401);
    }
}

/* ------------------------------------------------------------------ */
/* Crypto — complaint passwords are encrypted at rest (AES-256-GCM).  */
/* They are NEVER returned by the API; a future admin panel decrypts. */
/* ------------------------------------------------------------------ */

function app_secret(): string
{
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $fromEnv = env_str('APP_KEY');
    if ($fromEnv) {
        $cached = hash('sha256', $fromEnv, true);
        return $cached;
    }

    $pdo = getPDO();
    $stmt = $pdo->prepare('SELECT v FROM settings WHERE k = :k LIMIT 1');
    $stmt->execute([':k' => 'secret_key']);
    $row = $stmt->fetch();
    $key = $row && !empty($row['v']) ? (string) $row['v'] : '';

    if ($key === '') {
        $key = bin2hex(random_bytes(32));
        $now = date('Y-m-d H:i:s');
        try {
            $insert = $pdo->prepare('INSERT INTO settings (k, v, updated_at) VALUES (:k, :v, :t)');
            $insert->execute([':k' => 'secret_key', ':v' => $key, ':t' => $now]);
        } catch (Throwable $e) {
            // another request won the race — read it back
            $stmt->execute([':k' => 'secret_key']);
            $row = $stmt->fetch();
            $key = $row ? (string) $row['v'] : $key;
        }
    }

    $cached = hash('sha256', $key, true);
    return $cached;
}

function encrypt_secret(string $plain): string
{
    if ($plain === '') {
        return '';
    }
    if (!function_exists('openssl_encrypt')) {
        // No openssl in this build: reversible-at-rest is impossible, hash instead.
        return 'sha1:' . hash('sha256', $plain);
    }
    $iv  = random_bytes(12);
    $tag = '';
    $ct  = openssl_encrypt($plain, 'aes-256-gcm', app_secret(), OPENSSL_RAW_DATA, $iv, $tag);
    if ($ct === false) {
        return 'sha1:' . hash('sha256', $plain);
    }
    return 'enc:v1:' . base64_encode($iv . $tag . $ct);
}

function decrypt_secret(string $stored): string
{
    if ($stored === '') {
        return '';
    }
    if (!str_starts_with($stored, 'enc:v1:')) {
        return '';
    }
    $blob = base64_decode(substr($stored, 7), true);
    if ($blob === false || strlen($blob) < 29) {
        return '';
    }
    $iv  = substr($blob, 0, 12);
    $tag = substr($blob, 12, 16);
    $ct  = substr($blob, 28);
    $out = openssl_decrypt($ct, 'aes-256-gcm', app_secret(), OPENSSL_RAW_DATA, $iv, $tag);
    return $out === false ? '' : $out;
}

/* ------------------------------------------------------------------ */
/* Uploads                                                            */
/* ------------------------------------------------------------------ */

function upload_dir(): string
{
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $candidates = [
        env_str('UPLOAD_DIR'),
        APP_ROOT . '/data/uploads',
        sys_get_temp_dir() . '/parimatch_uploads',
    ];

    foreach ($candidates as $dir) {
        if (!$dir) {
            continue;
        }
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
        if (is_dir($dir) && is_writable($dir)) {
            $cached = rtrim($dir, '/');
            return $cached;
        }
    }

    $cached = rtrim(sys_get_temp_dir(), '/');
    return $cached;
}

function safe_filename(string $name): string
{
    $name = basename(str_replace('\\', '/', $name));
    $name = preg_replace('/[^\w.\- ()]+/u', '_', $name) ?: 'file';
    $name = trim($name);
    if ($name === '' || $name === '.' || $name === '..') {
        $name = 'file';
    }
    return str_limit($name, 150);
}

function file_extension(string $name): string
{
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    return preg_match('/^[a-z0-9]{1,10}$/', $ext) ? $ext : '';
}

function upload_url(string $id, string $token): string
{
    return '/api/uploads/' . rawurlencode($id) . '?k=' . rawurlencode($token);
}

/** Store one $_FILES entry and return its metadata row. */
function store_upload(array $file, string $clientId): array
{
    $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($error !== UPLOAD_ERR_OK) {
        $map = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds the server upload limit',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds the form upload limit',
            UPLOAD_ERR_PARTIAL    => 'File upload was interrupted',
            UPLOAD_ERR_NO_FILE    => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Server temp folder missing',
            UPLOAD_ERR_CANT_WRITE => 'Server cannot write the file',
            UPLOAD_ERR_EXTENSION  => 'Upload blocked by a server extension',
        ];
        json_error($map[$error] ?? 'Upload failed', 400);
    }

    $tmpPath = $file['tmp_name'] ?? '';
    $size    = (int) ($file['size'] ?? 0);
    $name    = safe_filename((string) ($file['name'] ?? 'file'));
    $ext     = file_extension($name);

    if (!is_file($tmpPath)) {
        json_error('Uploaded file missing', 400);
    }
    if ($size <= 0) {
        json_error('Empty file', 400);
    }
    if ($size > MAX_UPLOAD_BYTES) {
        json_error('File too large', 413, ['max_bytes' => MAX_UPLOAD_BYTES]);
    }

    $mime = 'application/octet-stream';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_file($finfo, $tmpPath);
            finfo_close($finfo);
            if (is_string($detected) && $detected !== '') {
                $mime = $detected;
            }
        }
    }
    if ($mime === 'application/octet-stream' && !empty($file['type'])) {
        $mime = (string) $file['type'];
    }

    $allowedMime = in_array($mime, ALLOWED_MIME, true);
    $allowedExt  = $ext !== '' && in_array($ext, ALLOWED_EXT, true);
    if (!$allowedMime && !$allowedExt) {
        json_error('File type not allowed', 415, ['mime' => $mime]);
    }

    $id    = bin2hex(random_bytes(12));
    $token = bin2hex(random_bytes(16));
    $now   = date('Y-m-d H:i:s');

    // Prefer the filesystem; fall back to a DB blob when nothing is writable.
    $dir      = upload_dir();
    $path     = $dir . '/' . $id . ($ext ? '.' . $ext : '.bin');
    $storage  = 'db';
    $storedPath = null;

    if (is_dir($dir) && is_writable($dir) && @move_uploaded_file($tmpPath, $path)) {
        $storage    = 'fs';
        $storedPath = $path;
    } elseif (is_dir($dir) && is_writable($dir) && @rename($tmpPath, $path)) {
        $storage    = 'fs';
        $storedPath = $path;
    }

    $pdo = getPDO();
    if ($storage === 'fs') {
        $stmt = $pdo->prepare('INSERT INTO uploads (id, client_id, token, name, mime, size, storage, path, data, created_at)
                               VALUES (:id, :cid, :token, :name, :mime, :size, :storage, :path, NULL, :t)');
        $stmt->execute([
            ':id' => $id, ':cid' => $clientId, ':token' => $token, ':name' => $name,
            ':mime' => $mime, ':size' => $size, ':storage' => 'fs', ':path' => $storedPath, ':t' => $now,
        ]);
    } else {
        $blob = file_get_contents($tmpPath);
        if ($blob === false) {
            json_error('Could not read uploaded file', 500);
        }
        $stmt = $pdo->prepare('INSERT INTO uploads (id, client_id, token, name, mime, size, storage, path, data, created_at)
                               VALUES (:id, :cid, :token, :name, :mime, :size, :storage, NULL, :data, :t)');
        $stmt->bindValue(':id', $id);
        $stmt->bindValue(':cid', $clientId);
        $stmt->bindValue(':token', $token);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':mime', $mime);
        $stmt->bindValue(':size', $size, PDO::PARAM_INT);
        $stmt->bindValue(':storage', 'db');
        $stmt->bindValue(':data', $blob, PDO::PARAM_LOB);
        $stmt->bindValue(':t', $now);
        $stmt->execute();
    }

    return [
        'id'    => $id,
        'name'  => $name,
        'type'  => $mime,
        'size'  => $size,
        'url'   => upload_url($id, $token),
    ];
}

/** Remove an upload row (and its disk file). */
function delete_upload(string $id): void
{
    $pdo  = getPDO();
    $stmt = $pdo->prepare('SELECT path FROM uploads WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) {
        return;
    }
    if (!empty($row['path']) && is_file($row['path'])) {
        @unlink($row['path']);
    }
    $pdo->prepare('DELETE FROM uploads WHERE id = :id')->execute([':id' => $id]);
}

/** Delete every upload referenced by a stored `files` JSON payload. */
function delete_uploads_from_files(?string $filesJson): void
{
    if (!$filesJson) {
        return;
    }
    $files = json_decode($filesJson, true);
    if (!is_array($files)) {
        return;
    }
    foreach ($files as $file) {
        if (is_array($file) && !empty($file['id'])) {
            delete_upload((string) $file['id']);
        }
    }
}

/* ------------------------------------------------------------------ */
/* Normalisation — one shape for localStorage rows and SQL rows      */
/* ------------------------------------------------------------------ */

/** MySQL/SQLite datetime -> ISO-8601 (safe for `new Date()` in every browser). */
function to_iso(?string $datetime): string
{
    if (!$datetime) {
        return '';
    }
    $ts = strtotime((string) $datetime);
    return $ts === false ? (string) $datetime : date('c', $ts);
}

function decode_json_object(?string $json): array
{
    if (!$json) {
        return [];
    }
    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : [];
}

/** Normalise a `files` map: [{name,type,size,url}] with legacy data-URL support. */
function normalize_files($files): array
{
    if (is_string($files)) {
        $files = decode_json_object($files);
    }
    if (!is_array($files)) {
        return [];
    }

    $out = [];
    foreach ($files as $key => $file) {
        if (!is_array($file)) {
            continue;
        }
        $entry = [
            'name' => (string) ($file['name'] ?? ''),
            'type' => (string) ($file['type'] ?? ''),
            'size' => (int) ($file['size'] ?? 0),
        ];
        if (!empty($file['url'])) {
            $entry['url'] = (string) $file['url'];
        } elseif (!empty($file['id'])) {
            $entry['url'] = '/api/uploads/' . rawurlencode((string) $file['id']);
        }
        if (!empty($file['data']) && is_string($file['data'])) {
            $entry['data'] = $file['data']; // legacy base64 (old local rows)
        }
        $out[(string) $key] = $entry;
    }
    return $out;
}

/** SQL row -> API shape used by the frontend. */
function normalize_complain(array $row): array
{
    $extra = decode_json_object($row['extra'] ?? null);
    $files = normalize_files($row['files'] ?? null);

    $details = [];
    $details['userName'] = (string) ($row['user_name'] ?? '');
    $details['mobile']   = (string) ($row['mobile'] ?? '');
    $details['email']    = (string) ($row['email'] ?? '');
    if (($row['amount'] ?? null) !== null && $row['amount'] !== '') {
        $details['amount'] = (string) $row['amount'];
    }
    if (($row['message'] ?? null) !== null && $row['message'] !== '') {
        $details['message'] = (string) $row['message'];
    }
    foreach ($extra as $k => $v) {
        if (!array_key_exists($k, $details) && $v !== null && $v !== '') {
            $details[(string) $k] = $v;
        }
    }

    return [
        'id'          => (string) $row['id'],
        'type'        => (string) $row['type'],
        'title'       => (string) ($row['title'] ?? ''),
        'status'      => (string) ($row['status'] ?? 'pending'),
        'createdAt'   => to_iso($row['created_at'] ?? null),
        'updatedAt'   => to_iso($row['updated_at'] ?? null),
        'details'     => $details,
        'hasPassword' => trim((string) ($row['password'] ?? '')) !== '',
        'files'       => $files,
    ];
}

function normalize_chat_row(array $row): array
{
    $file = decode_json_object($row['file_json'] ?? null);
    $out = [
        'id'        => (string) $row['id'],
        'sender'    => (string) ($row['sender'] ?? 'user'),
        'text'      => (string) ($row['text'] ?? ''),
        'createdAt' => to_iso($row['created_at'] ?? null),
        'edited'    => (bool) ($row['edited'] ?? false),
        'file'      => null,
    ];

    if ($file) {
        $entry = [
            'name' => (string) ($file['name'] ?? ''),
            'type' => (string) ($file['type'] ?? ''),
            'size' => (int) ($file['size'] ?? 0),
        ];
        if (!empty($file['url'])) {
            $entry['url'] = (string) $file['url'];
        } elseif (!empty($file['id'])) {
            $entry['url'] = '/api/uploads/' . rawurlencode((string) $file['id']);
        }
        if (!empty($file['data']) && is_string($file['data'])) {
            $entry['data'] = $file['data'];
        }
        $out['file'] = $entry;
    }

    return $out;
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

/** Multibyte-safe truncation that also works when mbstring is missing. */
function str_limit(string $value, int $max): string
{
    if ($max <= 0) {
        return '';
    }
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max);
    }
    return substr($value, 0, $max);
}

function text_field($value, int $max = 500): string
{
    if (is_array($value) || is_object($value)) {
        return '';
    }
    $value = trim((string) $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? '';
    return str_limit($value, $max);
}

function valid_mobile(string $mobile): bool
{
    return (bool) preg_match('/^[0-9+\-\s()]{6,32}$/', $mobile);
}

function valid_email(string $email): bool
{
    return $email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function iso_datetime(string $value): string
{
    if ($value === '') {
        return date('Y-m-d H:i:s');
    }
    $ts = strtotime($value);
    return $ts === false ? date('Y-m-d H:i:s') : date('Y-m-d H:i:s', $ts);
}

/* ------------------------------------------------------------------ */
/* Rate limiting (per IP + bucket)                                    */
/* ------------------------------------------------------------------ */

function client_ip(): string
{
    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded !== '') {
        $first = trim(explode(',', $forwarded)[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) {
            return $first;
        }
    }
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    return filter_var($remote, FILTER_VALIDATE_IP) ? $remote : '0.0.0.0';
}

function rate_limit(string $bucket, int $max, int $windowSeconds): void
{
    $pdo = getPDO();
    $key = $bucket . '|' . client_ip();
    $now = time();

    $stmt = $pdo->prepare('SELECT count, window_start FROM rate_limits WHERE k = :k');
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch();

    if (!$row || ($now - (int) $row['window_start']) >= $windowSeconds) {
        try {
            $pdo->prepare('DELETE FROM rate_limits WHERE k = :k')->execute([':k' => $key]);
            $pdo->prepare('INSERT INTO rate_limits (k, count, window_start) VALUES (:k, 1, :w)')
                ->execute([':k' => $key, ':w' => $now]);
        } catch (Throwable $e) {
            // concurrent insert — ignore
        }
        return;
    }

    if ((int) $row['count'] >= $max) {
        $retry = max(1, $windowSeconds - ($now - (int) $row['window_start']));
        header('Retry-After: ' . $retry);
        json_error('Too many requests, please slow down', 429, ['retry_after' => $retry]);
    }

    $pdo->prepare('UPDATE rate_limits SET count = count + 1 WHERE k = :k')->execute([':k' => $key]);
}
