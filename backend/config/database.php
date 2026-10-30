<?php
/**
 * config/database.php — PDO connection + automatic schema creation.
 *
 * MySQL  : used when DB_HOST + DB_NAME + DB_USER are set (production).
 * SQLite : automatic fallback (local dev / Wasmer Edge where no MySQL exists).
 *
 * The schema is created on first use for BOTH drivers, so a fresh database
 * works without running sql/schema.sql by hand.
 */

declare(strict_types=1);

function getPDO(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $driver = 'sqlite';

    $host = env_str('DB_HOST');
    $name = env_str('DB_NAME');
    $user = env_str('DB_USER');
    $pass = env_str('DB_PASS');

    if ($host && $name && $user) {
        $port = env_str('DB_PORT', '3306');
        $dsn  = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            // Never let an unreachable DB hang a request (Wasmer health checks).
            PDO::ATTR_TIMEOUT            => 5,
        ]);
        // Keep large rows (file metadata only, but be safe) working.
        try {
            $pdo->exec("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'");
            $pdo->exec('SET SESSION max_allowed_packet = 67108864');
        } catch (Throwable $e) {
            // session variables may be restricted — non fatal
        }
        $driver = 'mysql';
    } else {
        $sqlitePath = env_str('DB_PATH') ?: sqlite_default_path();
        $sqliteDir = dirname($sqlitePath);
        if (!is_dir($sqliteDir)) {
            @mkdir($sqliteDir, 0777, true);
        }
        $pdo = new PDO('sqlite:' . $sqlitePath, null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        // WAL is fastest, but it needs shared-memory support: on a network
        // volume (Wasmer Volumes are S3-backed) it can fail -> fall back.
        try {
            $pdo->exec('PRAGMA journal_mode = WAL');
        } catch (Throwable $e) {
            try { $pdo->exec('PRAGMA journal_mode = DELETE'); } catch (Throwable $e2) {}
        }
        $pdo->exec('PRAGMA busy_timeout = 5000');
        $pdo->exec('PRAGMA foreign_keys = ON');
    }

    initSchema($pdo, $driver);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    return $pdo;
}

/** First writable location for the SQLite file (Wasmer only allows /tmp). */
function sqlite_default_path(): string
{
    static $cached = null;
    if ($cached) {
        return $cached;
    }

    $candidates = [
        APP_ROOT . '/data/app.db',
        APP_ROOT . '/storage/app.db',
        sys_get_temp_dir() . '/parimatch_app.db',
    ];

    foreach ($candidates as $path) {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
        if (is_dir($dir) && is_writable($dir)) {
            $cached = $path;
            return $cached;
        }
    }

    $cached = sys_get_temp_dir() . '/parimatch_app.db';
    return $cached;
}

function initSchema(PDO $pdo, string $driver): void
{
    // Fast path: schema already provisioned by a previous request.
    try {
        $stmt = $pdo->query("SELECT v FROM settings WHERE k = 'schema_version' LIMIT 1");
        $row = $stmt ? $stmt->fetch() : null;
        if ($row && (string) $row['v'] === SCHEMA_VERSION) {
            return;
        }
    } catch (Throwable $e) {
        // table missing -> create everything below
    }

    $isSqlite = ($driver === 'sqlite');

    $complains = $isSqlite ? "
        CREATE TABLE IF NOT EXISTS complains (
            id          TEXT PRIMARY KEY,
            client_id   TEXT NOT NULL DEFAULT '',
            type        TEXT NOT NULL,
            title       TEXT NOT NULL DEFAULT '',
            user_name   TEXT NOT NULL,
            mobile      TEXT NOT NULL,
            password    TEXT NOT NULL DEFAULT '',
            email       TEXT NOT NULL DEFAULT '',
            amount      TEXT DEFAULT NULL,
            message     TEXT DEFAULT NULL,
            extra       TEXT DEFAULT NULL,
            files       TEXT DEFAULT NULL,
            status      TEXT NOT NULL DEFAULT 'pending',
            ip_address  TEXT DEFAULT NULL,
            created_at  DATETIME NOT NULL,
            updated_at  DATETIME NOT NULL
        )" : "
        CREATE TABLE IF NOT EXISTS complains (
            id          VARCHAR(64)  NOT NULL,
            client_id   VARCHAR(64)  NOT NULL DEFAULT '',
            type        VARCHAR(50)  NOT NULL,
            title       VARCHAR(255) NOT NULL DEFAULT '',
            user_name   VARCHAR(255) NOT NULL,
            mobile      VARCHAR(32)  NOT NULL,
            password    VARCHAR(1000) NOT NULL DEFAULT '',
            email       VARCHAR(255) NOT NULL DEFAULT '',
            amount      VARCHAR(50)  DEFAULT NULL,
            message     TEXT         DEFAULT NULL,
            extra       LONGTEXT     DEFAULT NULL,
            files       LONGTEXT     DEFAULT NULL,
            status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
            ip_address  VARCHAR(45)  DEFAULT NULL,
            created_at  DATETIME     NOT NULL,
            updated_at  DATETIME     NOT NULL,
            PRIMARY KEY (id),
            KEY idx_complains_client (client_id),
            KEY idx_complains_type (type),
            KEY idx_complains_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $chat = $isSqlite ? "
        CREATE TABLE IF NOT EXISTS chat_messages (
            id            TEXT PRIMARY KEY,
            client_id     TEXT NOT NULL DEFAULT '',
            sender        TEXT NOT NULL DEFAULT 'user',
            sender_name   TEXT DEFAULT NULL,
            sender_mobile TEXT DEFAULT NULL,
            text          TEXT DEFAULT NULL,
            file_json     TEXT DEFAULT NULL,
            reply_to      TEXT DEFAULT NULL,
            edited        INTEGER NOT NULL DEFAULT 0,
            edited_at     DATETIME DEFAULT NULL,
            created_at    DATETIME NOT NULL,
            updated_at    DATETIME NOT NULL
        )" : "
        CREATE TABLE IF NOT EXISTS chat_messages (
            id            VARCHAR(64)  NOT NULL,
            client_id     VARCHAR(64)  NOT NULL DEFAULT '',
            sender        VARCHAR(20)  NOT NULL DEFAULT 'user',
            sender_name   VARCHAR(255) DEFAULT NULL,
            sender_mobile VARCHAR(32)  DEFAULT NULL,
            text          TEXT         DEFAULT NULL,
            file_json     LONGTEXT     DEFAULT NULL,
            reply_to      VARCHAR(64)  DEFAULT NULL,
            edited        TINYINT(1)   NOT NULL DEFAULT 0,
            edited_at     DATETIME     DEFAULT NULL,
            created_at    DATETIME     NOT NULL,
            updated_at    DATETIME     NOT NULL,
            PRIMARY KEY (id),
            KEY idx_chat_client (client_id),
            KEY idx_chat_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    // Files are stored on disk when possible, in the DB blob as fallback.
    $uploads = $isSqlite ? "
        CREATE TABLE IF NOT EXISTS uploads (
            id         TEXT PRIMARY KEY,
            client_id  TEXT NOT NULL DEFAULT '',
            token      TEXT NOT NULL,
            name       TEXT NOT NULL,
            mime       TEXT NOT NULL DEFAULT 'application/octet-stream',
            size       INTEGER NOT NULL DEFAULT 0,
            storage    TEXT NOT NULL DEFAULT 'fs',
            path       TEXT DEFAULT NULL,
            data       BLOB DEFAULT NULL,
            created_at DATETIME NOT NULL
        )" : "
        CREATE TABLE IF NOT EXISTS uploads (
            id         VARCHAR(64)  NOT NULL,
            client_id  VARCHAR(64)  NOT NULL DEFAULT '',
            token      VARCHAR(64)  NOT NULL,
            name       VARCHAR(255) NOT NULL,
            mime       VARCHAR(150) NOT NULL DEFAULT 'application/octet-stream',
            size       BIGINT UNSIGNED NOT NULL DEFAULT 0,
            storage    VARCHAR(10)  NOT NULL DEFAULT 'fs',
            path       VARCHAR(1000) DEFAULT NULL,
            data       LONGBLOB     DEFAULT NULL,
            created_at DATETIME     NOT NULL,
            PRIMARY KEY (id),
            KEY idx_uploads_client (client_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $admin = $isSqlite ? "
        CREATE TABLE IF NOT EXISTS admin_users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            display_name  TEXT DEFAULT NULL,
            created_at    DATETIME NOT NULL,
            updated_at    DATETIME NOT NULL
        )" : "
        CREATE TABLE IF NOT EXISTS admin_users (
            id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
            username      VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            display_name  VARCHAR(255) DEFAULT NULL,
            created_at    DATETIME NOT NULL,
            updated_at    DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_admin_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $settings = $isSqlite ? "
        CREATE TABLE IF NOT EXISTS settings (
            k TEXT PRIMARY KEY,
            v TEXT DEFAULT NULL,
            updated_at DATETIME NOT NULL
        )" : "
        CREATE TABLE IF NOT EXISTS settings (
            k VARCHAR(100) NOT NULL,
            v TEXT DEFAULT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (k)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $rate = $isSqlite ? "
        CREATE TABLE IF NOT EXISTS rate_limits (
            k TEXT PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0,
            window_start INTEGER NOT NULL DEFAULT 0
        )" : "
        CREATE TABLE IF NOT EXISTS rate_limits (
            k VARCHAR(190) NOT NULL,
            count INT NOT NULL DEFAULT 0,
            window_start BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY (k)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    foreach ([$complains, $chat, $uploads, $admin, $settings, $rate] as $ddl) {
        $pdo->exec($ddl);
    }

    if ($isSqlite) {
        foreach ([
            'CREATE INDEX IF NOT EXISTS idx_complains_client ON complains(client_id)',
            'CREATE INDEX IF NOT EXISTS idx_complains_type ON complains(type)',
            'CREATE INDEX IF NOT EXISTS idx_complains_created ON complains(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_chat_client ON chat_messages(client_id)',
            'CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_uploads_client ON uploads(client_id)',
        ] as $idx) {
            $pdo->exec($idx);
        }
    }

    seedDefaults($pdo, $isSqlite);

    // record the provisioned version so the next request can skip the DDL
    try {
        $pdo->prepare('UPDATE settings SET v = :v, updated_at = :t WHERE k = :k')
            ->execute([':v' => SCHEMA_VERSION, ':t' => date('Y-m-d H:i:s'), ':k' => 'schema_version']);
    } catch (Throwable $e) {
    }
}

/** Idempotent seed rows (settings + default admin placeholder). */
function seedDefaults(PDO $pdo, bool $isSqlite): void
{
    $now = date('Y-m-d H:i:s');

    $insertSetting = $isSqlite
        ? 'INSERT OR IGNORE INTO settings (k, v, updated_at) VALUES (:k, :v, :t)'
        : 'INSERT IGNORE INTO settings (k, v, updated_at) VALUES (:k, :v, :t)';

    $defaults = [
        'site_name'      => 'Parimatch Support Center',
        'maintenance'    => '0',
        'schema_version' => SCHEMA_VERSION,
    ];

    $stmt = $pdo->prepare($insertSetting);
    foreach ($defaults as $k => $v) {
        $stmt->execute([':k' => $k, ':v' => $v, ':t' => $now]);
    }

    // Default admin for the future admin panel (password: Admin@123 — change it).
    // bcrypt $2y$ hash generated with password_hash('Admin@123', PASSWORD_BCRYPT).
    $adminHash = '$2y$10$GukC1soMszgDzpSnwc0hjeuv6ISfY4ymGu7O8emZTWOzhw2n8udqm';
    $insertAdmin = $isSqlite
        ? 'INSERT OR IGNORE INTO admin_users (username, password_hash, display_name, created_at, updated_at) VALUES (:u, :h, :d, :t, :t)'
        : 'INSERT IGNORE INTO admin_users (username, password_hash, display_name, created_at, updated_at) VALUES (:u, :h, :d, :t, :t)';
    try {
        $pdo->prepare($insertAdmin)->execute([
            ':u' => 'admin',
            ':h' => $adminHash,
            ':d' => 'Super Admin',
            ':t' => $now,
        ]);
    } catch (Throwable $e) {
        // unique constraint race — ignore
    }
}

/** Which driver is in use (used by /api/health). */
function db_driver(PDO $pdo): string
{
    return $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
}
