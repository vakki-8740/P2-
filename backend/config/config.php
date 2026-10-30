<?php
/**
 * config/config.php — environment, constants, CORS and shared boot helpers.
 * Loaded by app/index.php. Works locally (php -S) and on Wasmer Edge.
 */

declare(strict_types=1);

if (!defined('APP_NAME')) {
    define('APP_NAME', 'parimatch-support-backend');
    define('APP_VERSION', '1.2.0'); // bump = marker that the volume/persistence code is live
}

/* ------------------------------------------------------------------
 * Project root resolver
 * Locally: backend/app/index.php  -> backend/
 * Wasmer : /app/index.php         -> /app (config/ and sql/ mounted inside)
 * ------------------------------------------------------------------ */
if (!defined('APP_ROOT')) {
    $rootCandidates = [dirname(__DIR__), __DIR__];
    $found = null;
    foreach ($rootCandidates as $candidate) {
        if (is_dir($candidate . '/config')) {
            $found = $candidate;
            break;
        }
    }
    define('APP_ROOT', $found ?: dirname(__DIR__));
}

/* ------------------------------------------------------------------
 * Env helper (Wasmer secrets, docker env, local .env files)
 * ------------------------------------------------------------------ */
function env_str(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? null;
    }
    if ($value === null || $value === '') {
        return $default;
    }
    return is_string($value) ? trim($value) : $default;
}

function env_int(string $key, int $default): int
{
    $value = env_str($key);
    return ($value !== null && is_numeric($value)) ? (int) $value : $default;
}

/* ------------------------------------------------------------------
 * Application limits
 * ------------------------------------------------------------------ */
define('SCHEMA_VERSION', '2');

define('MAX_UPLOAD_BYTES', env_int('MAX_UPLOAD_MB', 100) * 1024 * 1024); // 100 MB
define('MAX_REQUEST_BYTES', env_int('MAX_REQUEST_MB', 300) * 1024 * 1024); // 300 MB
define('MAX_PAGE_SIZE', 500);

/** Uploads accepted for complaints and chat. */
const ALLOWED_MIME = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
];

const ALLOWED_EXT = [
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip',
];

/* ------------------------------------------------------------------
 * CORS
 * CORS_ORIGINS="https://a.vercel.app,https://*.vercel.app,http://localhost:5173"
 * Unset / "*" -> any origin (public support API, data is client-scoped).
 * ------------------------------------------------------------------ */
function cors_allowed_origin(string $origin, ?string $allowed): bool
{
    $allowed = trim((string) $allowed);
    if ($allowed === '' || $allowed === '*') {
        return true;
    }
    foreach (array_map('trim', explode(',', $allowed)) as $rule) {
        if ($rule === '') {
            continue;
        }
        if ($rule === $origin) {
            return true;
        }
        if (str_starts_with($rule, '*.')) {
            $host = parse_url($origin, PHP_URL_HOST) ?: '';
            $suffix = substr($rule, 1); // ".vercel.app"
            if ($host !== '' && str_ends_with(strtolower($host), strtolower($suffix))) {
                return true;
            }
        }
    }
    return false;
}

function send_cors_headers(): void
{
    $allowed = env_str('CORS_ORIGINS', '*');
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($allowed === '*') {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin !== '' && cors_allowed_origin($origin, $allowed)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    } elseif ($origin !== '') {
        // Origin not allowed: no CORS headers, browser blocks the read.
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Client-Id, X-Admin-Token, X-Requested-With, Authorization');
    header('Access-Control-Expose-Headers: Content-Disposition, Content-Length');
    header('Access-Control-Max-Age: 86400');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header('X-Frame-Options: DENY');
}
