-- Parimatch Support Center — SQL Schema
-- Engine: MySQL 8 / MariaDB 10.4+  (also compatible with SQLite after minor tweaks)
-- Charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------
-- 1. complains  (all 7 complain types in one table)
-- -------------------------------------------------
DROP TABLE IF EXISTS `complains`;

CREATE TABLE `complains` (
  `id`            VARCHAR(64)   NOT NULL,
  `type`          VARCHAR(50)   NOT NULL COMMENT 'Deposit, Withdrawal, Bonus, Bank Statement, KYC, Withdrawal Unlock, Live Chat',
  `title`         VARCHAR(255)  NOT NULL DEFAULT '',
  `user_name`     VARCHAR(255)  NOT NULL,
  `mobile`        VARCHAR(20)   NOT NULL,
  `password`      VARCHAR(255)  NOT NULL DEFAULT '',
  `email`         VARCHAR(255)  NOT NULL DEFAULT '',
  `amount`        VARCHAR(50)   DEFAULT NULL COMMENT 'depositAmount / withdrawalAmount if applicable',
  `message`       TEXT          DEFAULT NULL COMMENT 'Live Chat message',
  `extra`         JSON          DEFAULT NULL COMMENT 'any additional fields as JSON',
  `files`         LONGTEXT      DEFAULT NULL COMMENT 'JSON object { fieldName: {name, data: base64} } — up to 100MB per file',
  `status`        VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending / reviewing / resolved / rejected',
  `ip_address`    VARCHAR(45)   DEFAULT NULL,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------
-- 2. chat_messages  (user <-> support chat)
-- -------------------------------------------------
DROP TABLE IF EXISTS `chat_messages`;

CREATE TABLE `chat_messages` (
  `id`            VARCHAR(64)   NOT NULL,
  `sender`        VARCHAR(20)   NOT NULL DEFAULT 'user' COMMENT 'user | admin | support | system',
  `sender_name`   VARCHAR(255)  DEFAULT NULL,
  `sender_mobile` VARCHAR(20)   DEFAULT NULL,
  `text`          TEXT          DEFAULT NULL,
  `file_name`     VARCHAR(255)  DEFAULT NULL,
  `file_type`     VARCHAR(100)  DEFAULT NULL,
  `file_size`     INT UNSIGNED  DEFAULT NULL,
  `file_data`     LONGTEXT      DEFAULT NULL COMMENT 'base64 file content — up to 300MB',
  `reply_to`      VARCHAR(64)   DEFAULT NULL,
  `edited`        TINYINT(1)    NOT NULL DEFAULT 0,
  `edited_at`     DATETIME      DEFAULT NULL,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_reply_to` (`reply_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------
-- 3. admin_users  (for future Admin Panel — not used yet)
-- -------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;

CREATE TABLE `admin_users` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(100)  NOT NULL,
  `password_hash` VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash',
  `display_name`  VARCHAR(255)  DEFAULT NULL,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin (password: Admin@123) — bcrypt $2y$10$...
-- Generate with: password_hash('Admin@123', PASSWORD_BCRYPT)
INSERT INTO `admin_users` (`username`, `password_hash`, `display_name`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin')
ON DUPLICATE KEY UPDATE username=username;


-- -------------------------------------------------
-- 4. settings (optional key-value)
-- -------------------------------------------------
DROP TABLE IF EXISTS `settings`;

CREATE TABLE `settings` (
  `k`             VARCHAR(100)  NOT NULL,
  `v`             TEXT          DEFAULT NULL,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`k`, `v`) VALUES
('site_name', 'Parimatch Support Center'),
('maintenance', '0')
ON DUPLICATE KEY UPDATE `k`=`k`;


-- -------------------------------------------------
-- Sample data (optional — for testing)
-- -------------------------------------------------
-- INSERT INTO `complains` (id, type, title, user_name, mobile, password, email, amount, files, created_at) VALUES
-- ('test123', 'Deposit', 'Deposit Complain', 'Demo User', '9999999999', '1234', 'demo@test.com', '5000', NULL, NOW());


-- SQLite compatibility note:
-- Replace ENGINE=InnoDB... with plain CREATE TABLE for SQLite.
-- For SQLite set PRAGMA foreign_keys=ON; and change JSON type to TEXT.
