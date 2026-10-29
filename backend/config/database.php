<?php
// backend/config/database.php
// Returns PDO instance — supports MySQL (production) and SQLite (local / Wasmer fallback)

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    // 1) Try MySQL if env vars are set (Wasmer secrets / .env)
    $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? null);
    $db   = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? null);
    $user = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? null);
    $pass = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? null);
    $port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? '3306');

    if ($host && $db && $user) {
        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    }

    // 2) Fallback: SQLite file (great for Wasmer Edge / local dev)
    // For Wasmer, filesystem is read-only except /tmp — we try multiple locations
    $candidates = [
        __DIR__ . '/../data/app.db',
        __DIR__ . '/../storage/app.db',
        sys_get_temp_dir() . '/parimatch_app.db',
        __DIR__ . '/../../data/app.db',
    ];

    $sqlitePath = null;
    foreach ($candidates as $p) {
        $dir = dirname($p);
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
        if (is_dir($dir) && is_writable($dir)) {
            $sqlitePath = $p;
            break;
        }
        // also check if file already exists
        if (file_exists($p)) {
            $sqlitePath = $p;
            break;
        }
    }
    if (!$sqlitePath) {
        $sqlitePath = sys_get_temp_dir() . '/parimatch_app.db';
    }

    $needInit = !file_exists($sqlitePath) || filesize($sqlitePath) === 0;

    $pdo = new PDO('sqlite:' . $sqlitePath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if ($needInit) {
        initSqliteSchema($pdo);
    }

    return $pdo;
}

function initSqliteSchema(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS complains (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            user_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            password TEXT NOT NULL DEFAULT '',
            email TEXT NOT NULL DEFAULT '',
            amount TEXT DEFAULT NULL,
            message TEXT DEFAULT NULL,
            extra TEXT DEFAULT NULL,
            files TEXT DEFAULT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            ip_address TEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT (datetime('now')),
            updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_complains_type ON complains(type);
        CREATE INDEX IF NOT EXISTS idx_complains_mobile ON complains(mobile);
        CREATE INDEX IF NOT EXISTS idx_complains_created ON complains(created_at);

        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            sender TEXT NOT NULL DEFAULT 'user',
            sender_name TEXT DEFAULT NULL,
            sender_mobile TEXT DEFAULT NULL,
            text TEXT DEFAULT NULL,
            file_name TEXT DEFAULT NULL,
            file_type TEXT DEFAULT NULL,
            file_size INTEGER DEFAULT NULL,
            file_data TEXT DEFAULT NULL,
            reply_to TEXT DEFAULT NULL,
            edited INTEGER NOT NULL DEFAULT 0,
            edited_at DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT (datetime('now')),
            updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            display_name TEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT (datetime('now')),
            updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS settings (
            k TEXT PRIMARY KEY,
            v TEXT DEFAULT NULL,
            updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        );
    ");

    // insert default admin (bcrypt hash for Admin@123)
    try {
        $pdo->exec("INSERT OR IGNORE INTO admin_users (username, password_hash, display_name) VALUES ('admin', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin')");
        $pdo->exec("INSERT OR IGNORE INTO settings (k, v) VALUES ('site_name', 'Parimatch Support Center'), ('maintenance', '0')");
    } catch (Throwable $e) {}
}
