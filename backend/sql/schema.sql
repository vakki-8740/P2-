-- =============================================================
-- Parimatch Support Center — SQL schema
-- Engine : MySQL 8 / MariaDB 10.4+   (SQLite is created automatically)
-- Charset: utf8mb4
--
-- The PHP backend also creates these tables automatically on first
-- request, so importing this file is optional. Import it when you want
-- to provision MySQL yourself (recommended for production):
--
--   mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < sql/schema.sql
-- =============================================================

SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- 1. complains — all 7 complaint types in one table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complains` (
  `id`          VARCHAR(64)   NOT NULL,
  `client_id`   VARCHAR(64)   NOT NULL DEFAULT '' COMMENT 'browser id (owner)',
  `type`        VARCHAR(50)   NOT NULL COMMENT 'Deposit, Withdrawal, Bonus, Bank Statement, KYC, Unlock Withdrawal, Live Chat',
  `title`       VARCHAR(255)  NOT NULL DEFAULT '',
  `user_name`   VARCHAR(255)  NOT NULL,
  `mobile`      VARCHAR(32)   NOT NULL,
  `password`    VARCHAR(1000) NOT NULL DEFAULT '' COMMENT 'AES-256-GCM ciphertext (enc:v1:...) — never returned by the API',
  `email`       VARCHAR(255)  NOT NULL DEFAULT '',
  `amount`      VARCHAR(50)   DEFAULT NULL COMMENT 'depositAmount / withdrawalAmount',
  `message`     TEXT          DEFAULT NULL,
  `extra`       LONGTEXT      DEFAULT NULL COMMENT 'extra form fields as JSON',
  `files`       LONGTEXT      DEFAULT NULL COMMENT 'JSON: {field:{id,name,type,size,url}}',
  `status`      VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending / reviewing / resolved / rejected',
  `ip_address`  VARCHAR(45)   DEFAULT NULL,
  `created_at`  DATETIME      NOT NULL,
  `updated_at`  DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_complains_client` (`client_id`),
  KEY `idx_complains_type` (`type`),
  KEY `idx_complains_status` (`status`),
  KEY `idx_complains_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. chat_messages — user <-> support chat (scoped per browser)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id`            VARCHAR(64)  NOT NULL,
  `client_id`     VARCHAR(64)  NOT NULL DEFAULT '',
  `sender`        VARCHAR(20)  NOT NULL DEFAULT 'user' COMMENT 'user | support | admin | system',
  `sender_name`   VARCHAR(255) DEFAULT NULL,
  `sender_mobile` VARCHAR(32)  DEFAULT NULL,
  `text`          TEXT         DEFAULT NULL,
  `file_json`     LONGTEXT     DEFAULT NULL COMMENT 'JSON: {id,name,type,size,url}',
  `reply_to`      VARCHAR(64)  DEFAULT NULL,
  `edited`        TINYINT(1)   NOT NULL DEFAULT 0,
  `edited_at`     DATETIME     DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL,
  `updated_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chat_client` (`client_id`),
  KEY `idx_chat_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. uploads — complaint / chat attachments (metadata only)
--    Bytes live on disk when a writable folder exists, otherwise in
--    the `data` blob (Wasmer Edge fallback).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `uploads` (
  `id`         VARCHAR(64)     NOT NULL,
  `client_id`  VARCHAR(64)     NOT NULL DEFAULT '',
  `token`      VARCHAR(64)     NOT NULL COMMENT 'private download token',
  `name`       VARCHAR(255)    NOT NULL,
  `mime`       VARCHAR(150)    NOT NULL DEFAULT 'application/octet-stream',
  `size`       BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `storage`    VARCHAR(10)     NOT NULL DEFAULT 'fs' COMMENT 'fs | db',
  `path`       VARCHAR(1000)   DEFAULT NULL,
  `data`       LONGBLOB        DEFAULT NULL,
  `created_at` DATETIME        NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uploads_client` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 4. admin_users — reserved for the future Admin Panel
--    Default login: admin / Admin@123  (CHANGE IT before going live)
--    Hash generated with password_hash('Admin@123', PASSWORD_BCRYPT)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt',
  `display_name`  VARCHAR(255) DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL,
  `updated_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `admin_users` (`username`, `password_hash`, `display_name`, `created_at`, `updated_at`) VALUES
('admin', '$2y$10$GukC1soMszgDzpSnwc0hjeuv6ISfY4ymGu7O8emZTWOzhw2n8udqm', 'Super Admin', NOW(), NOW());

-- -------------------------------------------------------------
-- 5. settings — key/value (site_name, maintenance, secret_key, ...)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `k`          VARCHAR(100) NOT NULL,
  `v`          TEXT         DEFAULT NULL,
  `updated_at` DATETIME     NOT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `settings` (`k`, `v`, `updated_at`) VALUES
('site_name', 'Parimatch Support Center', NOW()),
('maintenance', '0', NOW()),
('schema_version', '2', NOW());

-- -------------------------------------------------------------
-- 6. rate_limits — simple per-IP throttling for write endpoints
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rate_limits` (
  `k`            VARCHAR(190) NOT NULL,
  `count`        INT          NOT NULL DEFAULT 0,
  `window_start` BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Optional: full reset (DESTROYS ALL DATA — uncomment to use)
-- -------------------------------------------------------------
-- DROP TABLE IF EXISTS `uploads`, `chat_messages`, `complains`, `rate_limits`;
-- TRUNCATE TABLE `complains`; TRUNCATE TABLE `chat_messages`; TRUNCATE TABLE `uploads`;
