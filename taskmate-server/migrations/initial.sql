-- Buat database & tabel
CREATE DATABASE IF NOT EXISTS taskmate_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskmate_db;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(64) NOT NULL UNIQUE,
  color VARCHAR(16) NOT NULL DEFAULT '#334155',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  deadline DATE NULL,
  category VARCHAR(64) DEFAULT 'Umum',
  priority ENUM('Low','Medium','High') DEFAULT 'Low',
  status ENUM('pending','done') DEFAULT 'pending',
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_category FOREIGN KEY (category)
    REFERENCES categories(`key`)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;
