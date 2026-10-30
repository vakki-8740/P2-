<?php
/**
 * Parimatch Support Center — PHP + SQL backend (Wasmer Edge ready).
 *
 * Single entry point. Every route lives under /api/*.
 * Works with `php -S` locally and with Wasmer's PHP runtime.
 *
 *   GET    /api/health
 *   GET    /api/complains                 (own complaints, ?scope=all needs admin token)
 *   POST   /api/complains
 *   GET    /api/complains/{id}
 *   DELETE /api/complains/{id}
 *   DELETE /api/complains                 (clear own complaints)
 *   GET    /api/chat/messages
 *   POST   /api/chat/messages
 *   PUT    /api/chat/messages/{id}
 *   DELETE /api/chat/messages/{id}
 *   DELETE /api/chat/messages             (clear own chat)
 *   POST   /api/uploads                   (multipart form field: file)
 *   GET    /api/uploads/{id}?k={token}    (raw file)
 */

declare(strict_types=1);

// config.php works out APP_ROOT; try the local layout first, then the
// Wasmer layout where config/ is mounted inside /app.
$configBootstrap = null;
foreach ([__DIR__ . '/../config/config.php', __DIR__ . '/config/config.php'] as $candidate) {
    if (is_file($candidate)) {
        $configBootstrap = $candidate;
        break;
    }
}
if ($configBootstrap === null) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'config/config.php not found']);
    exit;
}
require_once $configBootstrap;

require_once APP_ROOT . '/config/database.php';
require_once APP_ROOT . '/app/helpers.php';

send_cors_headers();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* Normalise the path: /app/api/... -> /api/... , drop trailing slash. */
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = preg_replace('#^/app/#', '/', $uri) ?? $uri;
$uri = preg_replace('#^/index\.php#', '', $uri) ?? $uri;
if ($uri === '') {
    $uri = '/';
}
if ($uri !== '/' && str_ends_with($uri, '/')) {
    $uri = rtrim($uri, '/');
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

/* ------------------------------------------------------------------ */
/* Raw file downloads must not send a JSON content type.              */
/* ------------------------------------------------------------------ */
if (($method === 'GET' || $method === 'HEAD') && preg_match('#^/api/uploads/([A-Za-z0-9._-]{6,80})$#', $uri, $m)) {
    serve_upload($m[1], $method === 'HEAD');
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/* ------------------------------------------------------------------ */
/* Health                                                             */
/* ------------------------------------------------------------------ */
if ($uri === '/' || $uri === '/api' || $uri === '/api/health' || $uri === '/health') {
    $dbOk = false;
    $dbError = null;
    $driver = 'none';
    try {
        $pdo = getPDO();
        $pdo->query('SELECT 1');
        $driver = db_driver($pdo);
        $dbOk = true;
    } catch (Throwable $e) {
        $dbError = $e->getMessage();
    }

    $uploadDir = upload_dir();
    $storage = is_dir($uploadDir) && is_writable($uploadDir) ? 'writable' : 'not-writable';

    // /tmp is wiped on every redeploy; a mounted volume (e.g. /data) is not.
    $dbPersistent = null;
    if ($driver === 'sqlite') {
        $dbFile = (string) (env_str('DB_PATH') ?: sqlite_default_path());
        $dbPersistent = strpos($dbFile, '/tmp/') !== 0;
    }
    $uploadPersistent = strpos($uploadDir, '/tmp/') !== 0;

    json_response([
        'ok' => true,
        'service' => APP_NAME,
        'version' => APP_VERSION,
        'time' => date('c'),
        'php' => PHP_VERSION,
        'db' => $dbOk ? 'connected' : 'error',
        'db_driver' => $driver,
        'db_error' => $dbError,
        'storage' => $storage,
        'upload_dir' => $dbOk ? basename($uploadDir) : null,
        'limits' => [
            'max_upload_mb' => intdiv(MAX_UPLOAD_BYTES, 1024 * 1024),
            'max_request_mb' => intdiv(MAX_REQUEST_BYTES, 1024 * 1024),
            'php_upload_max_filesize' => ini_get('upload_max_filesize'),
            'php_post_max_size' => ini_get('post_max_size'),
        ],
        'admin_scope_enabled' => admin_token() !== '',
        'db_persistent' => $dbPersistent,
        'upload_persistent' => $uploadPersistent,
    ]);
}

/* ------------------------------------------------------------------ */
/* Router                                                             */
/* ------------------------------------------------------------------ */
try {
    $pdo = getPDO();
} catch (Throwable $e) {
    json_error('Database connection failed', 500, ['detail' => $e->getMessage()]);
}

try {
    /* ============================ COMPLAINS ============================ */

    if ($method === 'GET' && $uri === '/api/complains') {
        $limit  = query_int('limit', 100, 1, MAX_PAGE_SIZE);
        $scope  = query_str('scope', 'mine');
        $type   = query_str('type');
        $status = query_str('status');

        $where  = [];
        $params = [];

        if ($scope === 'all') {
            require_admin();
        } else {
            $where[] = 'client_id = :client_id';
            $params[':client_id'] = require_client_id();
        }

        if ($type !== '') {
            $where[] = 'type = :type';
            $params[':type'] = $type;
        }
        if ($status !== '') {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }

        $sql = 'SELECT * FROM complains';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC, id DESC LIMIT :limit';

        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $rows = array_map('normalize_complain', $stmt->fetchAll());
        json_response(['ok' => true, 'data' => $rows, 'count' => count($rows)]);
    }

    if ($method === 'POST' && $uri === '/api/complains') {
        rate_limit('complain', 30, 60);
        $clientId = require_client_id();
        $body = request_body();

        $details = is_array($body['details'] ?? null) ? $body['details'] : $body;

        $type    = text_field($body['type'] ?? '', 50);
        $userName = text_field($details['userName'] ?? $details['user_name'] ?? '', 120);
        $mobile   = text_field($details['mobile'] ?? '', 32);
        $email    = text_field($details['email'] ?? '', 190);
        $password = text_field($details['password'] ?? '', 200);
        $amount   = text_field($details['depositAmount'] ?? $details['withdrawalAmount'] ?? $details['amount'] ?? '', 50);
        $message  = text_field($details['message'] ?? '', 5000);

        if ($type === '') {
            json_error('type is required', 422);
        }
        if ($userName === '') {
            json_error('userName is required', 422);
        }
        if ($mobile === '' || !valid_mobile($mobile)) {
            json_error('A valid mobile number is required', 422);
        }
        if (!valid_email($email)) {
            json_error('email is invalid', 422);
        }

        $title = text_field($body['title'] ?? '', 255);
        if ($title === '') {
            $title = $type . ' Complain';
        }

        /* Everything else the form sent (kycType, bonusType, ...) goes to `extra`. */
        $knownKeys = ['userName', 'user_name', 'mobile', 'email', 'password', 'amount',
            'depositAmount', 'withdrawalAmount', 'message'];
        $extra = [];
        foreach ($details as $key => $value) {
            if (in_array((string) $key, $knownKeys, true) || is_array($value)) {
                continue;
            }
            $clean = text_field($value, 500);
            if ($clean !== '') {
                $extra[(string) $key] = $clean;
            }
        }

        $files = claim_uploads($body['files'] ?? [], $clientId);

        $id = text_field($body['id'] ?? '', 64);
        if ($id === '' || !preg_match('/^[A-Za-z0-9._-]{4,64}$/', $id)) {
            $id = bin2hex(random_bytes(8));
        }

        $createdAt = iso_datetime(text_field($body['createdAt'] ?? $body['created_at'] ?? '', 40));
        $now = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare('INSERT INTO complains
            (id, client_id, type, title, user_name, mobile, password, email, amount, message, extra, files, status, ip_address, created_at, updated_at)
            VALUES
            (:id, :client_id, :type, :title, :user_name, :mobile, :password, :email, :amount, :message, :extra, :files, :status, :ip, :created_at, :updated_at)');

        $stmt->execute([
            ':id' => $id,
            ':client_id' => $clientId,
            ':type' => $type,
            ':title' => $title,
            ':user_name' => $userName,
            ':mobile' => $mobile,
            ':password' => encrypt_secret($password),
            ':email' => $email,
            ':amount' => $amount !== '' ? $amount : null,
            ':message' => $message !== '' ? $message : null,
            ':extra' => $extra ? json_encode($extra, JSON_UNESCAPED_UNICODE) : null,
            ':files' => $files ? json_encode($files, JSON_UNESCAPED_UNICODE) : null,
            ':status' => 'pending',
            ':ip' => substr(client_ip(), 0, 45),
            ':created_at' => $createdAt,
            ':updated_at' => $now,
        ]);

        $row = fetch_complain($pdo, $id);
        json_response(['ok' => true, 'data' => $row ? normalize_complain($row) : null, 'id' => $id], 201);
    }

    if ($method === 'GET' && preg_match('#^/api/complains/([A-Za-z0-9._-]{1,64})$#', $uri, $m)) {
        $row = fetch_complain($pdo, $m[1]);
        if (!$row) {
            json_error('Complaint not found', 404);
        }
        assert_can_access($row['client_id'] ?? '');
        json_ok(normalize_complain($row));
    }

    if ($method === 'DELETE' && preg_match('#^/api/complains/([A-Za-z0-9._-]{1,64})$#', $uri, $m)) {
        $row = fetch_complain($pdo, $m[1]);
        if (!$row) {
            json_error('Complaint not found', 404);
        }
        assert_can_access($row['client_id'] ?? '');

        delete_uploads_from_files($row['files'] ?? null);
        $pdo->prepare('DELETE FROM complains WHERE id = :id')->execute([':id' => $m[1]]);

        json_ok(['deleted' => 1, 'id' => $m[1]]);
    }

    if ($method === 'DELETE' && $uri === '/api/complains') {
        if (is_admin_request()) {
            $rows = $pdo->query('SELECT files FROM complains')->fetchAll();
            foreach ($rows as $row) {
                delete_uploads_from_files($row['files'] ?? null);
            }
            $deleted = $pdo->exec('DELETE FROM complains');
            json_ok(['deleted' => $deleted, 'scope' => 'all']);
        }

        $clientId = require_client_id();
        $stmt = $pdo->prepare('SELECT files FROM complains WHERE client_id = :cid');
        $stmt->execute([':cid' => $clientId]);
        foreach ($stmt->fetchAll() as $row) {
            delete_uploads_from_files($row['files'] ?? null);
        }

        $del = $pdo->prepare('DELETE FROM complains WHERE client_id = :cid');
        $del->execute([':cid' => $clientId]);
        json_ok(['deleted' => $del->rowCount(), 'scope' => 'mine']);
    }

    /* ============================== CHAT ============================== */

    if ($method === 'GET' && ($uri === '/api/chat/messages' || $uri === '/api/chat')) {
        $limit = query_int('limit', 200, 1, MAX_PAGE_SIZE);
        $scope = query_str('scope', 'mine');

        if ($scope === 'all') {
            require_admin();
            $stmt = $pdo->prepare('SELECT * FROM chat_messages ORDER BY created_at ASC, id ASC LIMIT :limit');
        } else {
            $clientId = require_client_id();
            $stmt = $pdo->prepare('SELECT * FROM chat_messages WHERE client_id = :cid ORDER BY created_at ASC, id ASC LIMIT :limit');
            $stmt->bindValue(':cid', $clientId, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $rows = array_map('normalize_chat_row', $stmt->fetchAll());
        json_response(['ok' => true, 'data' => $rows, 'count' => count($rows)]);
    }

    if ($method === 'POST' && ($uri === '/api/chat/messages' || $uri === '/api/chat')) {
        rate_limit('chat', 120, 60);
        $clientId = require_client_id();
        $body = request_body();

        $text = text_field($body['text'] ?? $body['message'] ?? '', 5000);

        // A visitor's messages are scoped to their own client id, so they may
        // write as "user" or "support" (the auto-reply bot). "admin"/"system"
        // are reserved for callers holding the admin API token.
        $sender = text_field($body['sender'] ?? 'user', 20);
        $allowed = is_admin_request()
            ? ['user', 'support', 'admin', 'system']
            : ['user', 'support'];
        if (!in_array($sender, $allowed, true)) {
            $sender = 'user';
        }

        $file = claim_uploads(isset($body['file']) ? ['file' => $body['file']] : [], $clientId);
        $file = $file['file'] ?? null;

        if ($text === '' && $file === null) {
            json_error('text or file is required', 422);
        }

        $id = text_field($body['id'] ?? '', 64);
        if ($id === '' || !preg_match('/^[A-Za-z0-9._-]{4,64}$/', $id)) {
            $id = bin2hex(random_bytes(8));
        }

        $createdAt = iso_datetime(text_field($body['createdAt'] ?? '', 40));
        $now = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare('INSERT INTO chat_messages
            (id, client_id, sender, sender_name, sender_mobile, text, file_json, reply_to, edited, created_at, updated_at)
            VALUES
            (:id, :client_id, :sender, :sender_name, :sender_mobile, :text, :file_json, :reply_to, 0, :created_at, :updated_at)');
        $stmt->execute([
            ':id' => $id,
            ':client_id' => $clientId,
            ':sender' => $sender,
            ':sender_name' => text_field($body['senderName'] ?? '', 120) ?: null,
            ':sender_mobile' => text_field($body['senderMobile'] ?? '', 32) ?: null,
            ':text' => $text !== '' ? $text : null,
            ':file_json' => $file ? json_encode($file, JSON_UNESCAPED_UNICODE) : null,
            ':reply_to' => text_field($body['replyTo'] ?? '', 64) ?: null,
            ':created_at' => $createdAt,
            ':updated_at' => $now,
        ]);

        $stmt = $pdo->prepare('SELECT * FROM chat_messages WHERE id = :id');
        $stmt->execute([':id' => $id]);
        json_response(['ok' => true, 'data' => normalize_chat_row($stmt->fetch() ?: []), 'id' => $id], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && preg_match('#^/api/chat/(?:messages|chat)/([A-Za-z0-9._-]{1,64})$#', $uri, $m)) {
        $clientId = require_client_id();
        $body = request_body();
        $text = text_field($body['text'] ?? $body['message'] ?? '', 5000);
        if ($text === '') {
            json_error('text is required', 422);
        }

        $stmt = $pdo->prepare('SELECT * FROM chat_messages WHERE id = :id');
        $stmt->execute([':id' => $m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            json_error('Message not found', 404);
        }
        if ($row['client_id'] !== $clientId) {
            require_admin();
        }

        $now = date('Y-m-d H:i:s');
        $pdo->prepare('UPDATE chat_messages SET text = :text, edited = 1, edited_at = :t, updated_at = :t WHERE id = :id')
            ->execute([':text' => $text, ':t' => $now, ':id' => $m[1]]);

        json_ok(['updated' => 1, 'id' => $m[1]]);
    }

    if ($method === 'DELETE' && preg_match('#^/api/chat/(?:messages|chat)/([A-Za-z0-9._-]{1,64})$#', $uri, $m)) {
        $stmt = $pdo->prepare('SELECT * FROM chat_messages WHERE id = :id');
        $stmt->execute([':id' => $m[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            json_error('Message not found', 404);
        }
        assert_can_access($row['client_id'] ?? '');

        delete_uploads_from_files($row['file_json'] ? json_encode(['file' => decode_json_object($row['file_json'])]) : null);
        $pdo->prepare('DELETE FROM chat_messages WHERE id = :id')->execute([':id' => $m[1]]);

        json_ok(['deleted' => 1, 'id' => $m[1]]);
    }

    if ($method === 'DELETE' && ($uri === '/api/chat/messages' || $uri === '/api/chat')) {
        if (is_admin_request()) {
            foreach ($pdo->query('SELECT file_json FROM chat_messages')->fetchAll() as $row) {
                delete_uploads_from_files($row['file_json'] ? json_encode(['file' => decode_json_object($row['file_json'])]) : null);
            }
            $deleted = $pdo->exec('DELETE FROM chat_messages');
            json_ok(['deleted' => $deleted, 'scope' => 'all']);
        }

        $clientId = require_client_id();
        $stmt = $pdo->prepare('SELECT file_json FROM chat_messages WHERE client_id = :cid');
        $stmt->execute([':cid' => $clientId]);
        foreach ($stmt->fetchAll() as $row) {
            delete_uploads_from_files($row['file_json'] ? json_encode(['file' => decode_json_object($row['file_json'])]) : null);
        }

        $del = $pdo->prepare('DELETE FROM chat_messages WHERE client_id = :cid');
        $del->execute([':cid' => $clientId]);
        json_ok(['deleted' => $del->rowCount(), 'scope' => 'mine']);
    }

    /* ============================= UPLOADS ============================ */

    if ($method === 'POST' && ($uri === '/api/uploads' || $uri === '/api/upload')) {
        rate_limit('upload', 60, 60);
        $clientId = require_client_id();

        if (empty($_FILES)) {
            json_error('No file received (multipart field "file")', 400);
        }

        $file = $_FILES['file'] ?? reset($_FILES);
        if (!is_array($file) || !isset($file['error']) || is_array($file['error'])) {
            json_error('Invalid upload', 400);
        }

        $stored = store_upload($file, $clientId);
        json_response(['ok' => true, 'data' => $stored], 201);
    }

    json_error('Not found', 404, ['path' => $uri, 'method' => $method]);

} catch (PDOException $e) {
    json_error('Database error', 500, ['detail' => $e->getMessage()]);
} catch (Throwable $e) {
    json_error('Server error', 500, ['detail' => $e->getMessage()]);
}

/* ------------------------------------------------------------------ */
/* Helpers used by the router                                         */
/* ------------------------------------------------------------------ */

function fetch_complain(PDO $pdo, string $id): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM complains WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/** Owner of the row, or an admin token, may touch it. */
function assert_can_access(string $ownerClientId): void
{
    if (is_admin_request()) {
        return;
    }
    $clientId = require_client_id();
    if (!hash_equals((string) $ownerClientId, (string) $clientId)) {
        json_error('Not found', 404);
    }
}

/**
 * Validate the `files` map sent by the client and rebuild its URLs from the
 * uploads table (never trust a client supplied URL).
 *
 * @param mixed $files  {field: {id, name, type, size, url}}
 * @return array{field: array{id,name,type,size,url}}
 */
function claim_uploads($files, string $clientId): array
{
    if (!is_array($files) || !$files) {
        return [];
    }

    $pdo = getPDO();
    $out = [];

    foreach ($files as $key => $file) {
        if (!is_array($file)) {
            continue;
        }
        $id = text_field($file['id'] ?? '', 64);
        if ($id === '' || !preg_match('/^[A-Za-z0-9._-]{4,64}$/', $id)) {
            continue;
        }

        $stmt = $pdo->prepare('SELECT id, token, name, mime, size FROM uploads WHERE id = :id AND client_id = :cid LIMIT 1');
        $stmt->execute([':id' => $id, ':cid' => $clientId]);
        $row = $stmt->fetch();
        if (!$row) {
            continue;
        }

        $out[(string) $key] = [
            'id'   => (string) $row['id'],
            'name' => (string) $row['name'],
            'type' => (string) $row['mime'],
            'size' => (int) $row['size'],
            'url'  => upload_url((string) $row['id'], (string) $row['token']),
        ];
    }

    return $out;
}

/** Stream an uploaded file after checking its access token / owner. */
function serve_upload(string $id, bool $headOnly = false): void
{
    $pdo = getPDO();
    $stmt = $pdo->prepare('SELECT * FROM uploads WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_error('File not found', 404);
    }

    $tokenOk = isset($_GET['k']) && is_string($_GET['k']) && hash_equals((string) $row['token'], $_GET['k']);
    $ownerOk = client_id() !== '' && hash_equals((string) $row['client_id'], client_id());
    if (!$tokenOk && !$ownerOk && !is_admin_request()) {
        json_error('File not found', 404);
    }

    $mime = (string) ($row['mime'] ?: 'application/octet-stream');
    $name = (string) ($row['name'] ?: 'file');
    $size = (int) ($row['size'] ?? 0);
    $inline = str_starts_with($mime, 'image/') || $mime === 'application/pdf' || $mime === 'text/plain';

    header('Content-Type: ' . $mime);
    header('Content-Length: ' . $size);
    header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment') . '; filename="' . rawurlencode($name) . '"');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: private, max-age=86400');
    header('Access-Control-Allow-Origin: *');

    if ($headOnly) {
        exit;
    }

    if (($row['storage'] ?? '') === 'fs' && !empty($row['path']) && is_file($row['path'])) {
        readfile($row['path']);
        exit;
    }

    if (isset($row['data']) && $row['data'] !== null && $row['data'] !== '') {
        if (is_resource($row['data'])) {
            fpassthru($row['data']);
        } else {
            echo $row['data'];
        }
        exit;
    }

    http_response_code(404);
    echo 'File missing';
    exit;
}
