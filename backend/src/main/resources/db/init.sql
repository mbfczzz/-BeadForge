CREATE DATABASE IF NOT EXISTS beadforge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE beadforge;

CREATE TABLE IF NOT EXISTS t_user (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    nickname    VARCHAR(50),
    avatar      VARCHAR(500),
    email       VARCHAR(100),
    phone       VARCHAR(20),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT  DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS t_design (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    title        VARCHAR(100) NOT NULL,
    description  TEXT,
    category     VARCHAR(50),
    cover_image  VARCHAR(500),
    design_data  JSON,
    status       VARCHAR(20)  DEFAULT 'DRAFT',
    like_count   INT          DEFAULT 0,
    view_count   INT          DEFAULT 0,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted      TINYINT      DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
