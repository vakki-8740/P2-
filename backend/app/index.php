<?php
// Parimatch Support Center — PHP Backend (Wasmer.io ready)
// Single-file router + controllers — no framework needed
// Supports MySQL and SQLite (auto-fallback)
// Deploy: wasmer deploy  (see backend/README.md)

declare(strict_types=1);

// --- CORS ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- helpers ---
require_once __DIR__ . '/../config/database.php';

function json($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function clientIp(): string {
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
}

function now(): string {
    return date('Y-m-d H:i:s');
}

// simple router
$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Wasmer: app is mounted at /app, but we want /api/* — normalize
// If request is /api/... or /app/api/... both work
$uri = preg_replace('#^/app/#', '/', $uri);

// --- Health ---
if ($uri === '/' || $uri === '/api' || $uri === '/api/health' || $uri === '/health') {
    try {
        $pdo = getPDO();
        $pdo->query('SELECT 1');
        $dbOk = true;
    } catch (Throwable $e) {
        $dbOk = false;
        $dbError = $e->getMessage();
    }
    json([
        'ok' => true,
        'service' => 'parimatch-support-backend',
        'time' => now(),
        'php' => PHP_VERSION,
        'db' => $dbOk ? 'connected' : 'error',
        'db_error' => $dbError ?? null,
        'endpoints' => [
            'GET  /api/health',
            'GET  /api/complains',
            'POST /api/complains',
            'GET  /api/complains/:id',
            'DELETE /api/complains/:id',
            'DELETE /api/complains (clear all)',
            'GET  /api/chat/messages',
            'POST /api/chat/messages',
            'PUT  /api/chat/messages/:id',
            'DELETE /api/chat/messages/:id',
        ]
    ]);
}

// Wrap all DB operations in try/catch for nice JSON errors
try {
    $pdo = getPDO();
} catch (Throwable $e) {
    json(['ok' => false, 'error' => 'DB connection failed', 'detail' => $e->getMessage()], 500);
}

// -------------------------------------------------------
// COMPLAINS
// -------------------------------------------------------

// GET /api/complains?limit=100&type=Deposit&mobile=xxx&status=pending
if ($method === 'GET' && $uri === '/api/complains') {
    $limit  = max(1, min(500, intval($_GET['limit'] ?? 100)));
    $type   = trim($_GET['type'] ?? '');
    $mobile = trim($_GET['mobile'] ?? '');
    $status = trim($_GET['status'] ?? '');

    $sql = "SELECT * FROM complains WHERE 1=1";
    $params = [];
    if ($type)   { $sql .= " AND type = :type";   $params['type'] = $type; }
    if ($mobile) { $sql .= " AND mobile = :mobile"; $params['mobile'] = $mobile; }
    if ($status) { $sql .= " AND status = :status"; $params['status'] = $status; }
    $sql .= " ORDER BY created_at DESC LIMIT :limit";

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue(':' . $k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    // decode JSON fields for frontend (extra, files)
    foreach ($rows as &$r) {
        $r['extra'] = $r['extra'] ? json_decode($r['extra'], true) : null;
        $r['files'] = $r['files'] ? json_decode($r['files'], true) : null;
        // map snake_case to camelCase aliases expected by frontend
        $r['userName'] = $r['user_name']; $r['createdAt'] = $r['created_at'];
    }

    json(['ok' => true, 'data' => $rows, 'count' => count($rows)]);
}

// POST /api/complains
if ($method === 'POST' && $uri === '/api/complains') {
    $body = getJsonBody();

    // Support both flat and nested payloads (frontend sends {id, type, title, details:{...}, files:{...}})
    $id    = trim($body['id'] ?? '');
    if (!$id) $id = substr(bin2hex(random_bytes(8)), 0, 12);
    $type  = trim($body['type'] ?? '');
    $title = trim($body['title'] ?? ($type ? $type . ' Complain' : 'Complain'));
    $createdAt = $body['createdAt'] ?? $body['created_at'] ?? now();

    // details may be nested or flat
    $details = $body['details'] ?? $body;
    $userName = trim($details['userName'] ?? $details['user_name'] ?? $body['user_name'] ?? '');
    $mobile   = trim($details['mobile'] ?? $body['mobile'] ?? '');
    $password = $details['password'] ?? $body['password'] ?? '';
    $email    = trim($details['email'] ?? $body['email'] ?? '');
    $amount   = $details['depositAmount'] ?? $details['withdrawalAmount'] ?? $details['amount'] ?? $body['amount'] ?? null;
    $message  = $details['message'] ?? $body['message'] ?? null;

    $files = $body['files'] ?? null;
    $extra = $body['extra'] ?? null;

    // Collect extra fields (anything not in core list)
    if (!$extra) {
        $extra = [];
        foreach (['depositAmount','withdrawalAmount','amount','message','kycType','bonusType'] as $k) {
            if (isset($details[$k])) $extra[$k] = $details[$k];
        }
        if (empty($extra)) $extra = null;
    }

    if (!$type)  json(['ok'=>false,'error'=>'type is required'], 400);
    if (!$userName) json(['ok'=>false,'error'=>'userName is required'], 400);
    if (!$mobile)   json(['ok'=>false,'error'=>'mobile is required'], 400);

    // 100MB file check already in frontend, but double-check total JSON size (approx)
    $filesJson = $files ? json_encode($files) : null;
    $extraJson = $extra ? json_encode($extra) : null;

    $stmt = $pdo->prepare("INSERT INTO complains (id, type, title, user_name, mobile, password, email, amount, message, extra, files, status, ip_address, created_at) VALUES (:id,:type,:title,:user_name,:mobile,:password,:email,:amount,:message,:extra,:files,'pending',:ip,:created_at)");
    $stmt->execute([
        ':id' => $id,
        ':type' => $type,
        ':title' => $title,
        ':user_name' => $userName,
        ':mobile' => $mobile,
        ':password' => (string)$password,
        ':email' => $email,
        ':amount' => $amount !== null ? (string)$amount : null,
        ':message' => $message,
        ':extra' => $extraJson,
        ':files' => $filesJson,
        ':ip' => clientIp(),
        ':created_at' => date('Y-m-d H:i:s', strtotime($createdAt) ?: time()),
    ]);

    json(['ok'=>true,'id'=>$id,'message'=>'Complaint submitted successfully'], 201);
}

// GET /api/complains/:id
if ($method === 'GET' && preg_match('#^/api/complains/([^/]+)$#', $uri, $m)) {
    $id = $m[1];
    $stmt = $pdo->prepare("SELECT * FROM complains WHERE id = :id LIMIT 1");
    $stmt->execute([':id'=>$id]);
    $row = $stmt->fetch();
    if (!$row) json(['ok'=>false,'error'=>'Not found'], 404);
    $row['extra'] = $row['extra'] ? json_decode($row['extra'], true) : null;
    $row['files'] = $row['files'] ? json_decode($row['files'], true) : null;
    $row['userName'] = $row['user_name']; $row['createdAt'] = $row['created_at'];
    json(['ok'=>true,'data'=>$row]);
}

// DELETE /api/complains/:id
if ($method === 'DELETE' && preg_match('#^/api/complains/([^/]+)$#', $uri, $m)) {
    $id = $m[1];
    $stmt = $pdo->prepare("DELETE FROM complains WHERE id = :id");
    $stmt->execute([':id'=>$id]);
    json(['ok'=>true,'deleted'=>$stmt->rowCount()]);
}

// DELETE /api/complains  (clear all)
if ($method === 'DELETE' && $uri === '/api/complains') {
    $pdo->exec("DELETE FROM complains");
    json(['ok'=>true,'message'=>'All complains cleared']);
}

// -------------------------------------------------------
// CHAT
// -------------------------------------------------------

// GET /api/chat/messages?limit=100
if ($method === 'GET' && ($uri === '/api/chat/messages' || $uri === '/api/chat')) {
    $limit = max(1, min(500, intval($_GET['limit'] ?? 100)));
    $stmt = $pdo->prepare("SELECT * FROM chat_messages ORDER BY created_at ASC LIMIT :limit");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    // map for frontend
    foreach ($rows as &$r) {
        $r['createdAt'] = $r['created_at'];
        $r['senderName'] = $r['sender_name'];
        if ($r['file_name']) {
            $r['file'] = [
                'name'=>$r['file_name'],
                'type'=>$r['file_type'],
                'size'=>$r['file_size'],
                'data'=>$r['file_data'],
            ];
        }
    }
    json(['ok'=>true,'data'=>$rows,'count'=>count($rows)]);
}

// POST /api/chat/messages
if ($method === 'POST' && ($uri === '/api/chat/messages' || $uri === '/api/chat')) {
    $body = getJsonBody();
    $id   = trim($body['id'] ?? bin2hex(random_bytes(8)));
    $sender = trim($body['sender'] ?? 'user');
    $text = $body['text'] ?? $body['message'] ?? '';
    $senderName = $body['senderName'] ?? $body['sender_name'] ?? null;
    $senderMobile = $body['senderMobile'] ?? $body['sender_mobile'] ?? null;

    $fileName = $fileType = $fileSize = $fileData = null;
    if (!empty($body['file']) && is_array($body['file'])) {
        $fileName = $body['file']['name'] ?? null;
        $fileType = $body['file']['type'] ?? null;
        $fileSize = intval($body['file']['size'] ?? 0);
        $fileData = $body['file']['data'] ?? null; // base64 up to 300MB
    } else {
        $fileName = $body['file_name'] ?? null;
        $fileType = $body['file_type'] ?? null;
        $fileSize = $body['file_size'] ?? null;
        $fileData = $body['file_data'] ?? null;
    }

    if (!$text && !$fileData) json(['ok'=>false,'error'=>'text or file required'], 400);

    $stmt = $pdo->prepare("INSERT INTO chat_messages (id, sender, sender_name, sender_mobile, text, file_name, file_type, file_size, file_data, reply_to, created_at) VALUES (:id,:sender,:sender_name,:sender_mobile,:text,:file_name,:file_type,:file_size,:file_data,:reply_to,:created_at)");
    $stmt->execute([
        ':id'=>$id,
        ':sender'=>$sender,
        ':sender_name'=>$senderName,
        ':sender_mobile'=>$senderMobile,
        ':text'=>$text,
        ':file_name'=>$fileName,
        ':file_type'=>$fileType,
        ':file_size'=>$fileSize,
        ':file_data'=>$fileData,
        ':reply_to'=>$body['reply_to'] ?? null,
        ':created_at'=> now(),
    ]);
    json(['ok'=>true,'id'=>$id], 201);
}

// PUT /api/chat/messages/:id  (edit)
if (($method === 'PUT' || $method === 'PATCH') && preg_match('#^/api/chat/messages/([^/]+)$#', $uri, $m)) {
    $id = $m[1];
    $body = getJsonBody();
    $text = $body['text'] ?? $body['message'] ?? '';
    if (!$text) json(['ok'=>false,'error'=>'text required'], 400);
    $stmt = $pdo->prepare("UPDATE chat_messages SET text=:text, edited=1, edited_at=:edited_at, updated_at=:updated_at WHERE id=:id");
    $stmt->execute([':text'=>$text, ':edited_at'=>now(), ':updated_at'=>now(), ':id'=>$id]);
    json(['ok'=>true,'updated'=>$stmt->rowCount()]);
}

// DELETE /api/chat/messages/:id
if ($method === 'DELETE' && preg_match('#^/api/chat/messages/([^/]+)$#', $uri, $m)) {
    $id = $m[1];
    $stmt = $pdo->prepare("DELETE FROM chat_messages WHERE id=:id");
    $stmt->execute([':id'=>$id]);
    json(['ok'=>true,'deleted'=>$stmt->rowCount()]);
}

// DELETE /api/chat/messages (clear all) / also /api/chat
if ($method === 'DELETE' && ($uri === '/api/chat/messages' || $uri === '/api/chat')) {
    $pdo->exec("DELETE FROM chat_messages");
    json(['ok'=>true,'message'=>'All messages cleared']);
}

// --- 404 ---
json(['ok'=>false,'error'=>'Not found','path'=>$uri,'method'=>$method], 404);
