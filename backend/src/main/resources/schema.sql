-- BeadForge 数据库建表脚本
CREATE DATABASE IF NOT EXISTS beadforge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE beadforge;

-- 用户表
CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(16) DEFAULT 'USER' COMMENT '角色: USER / ADMIN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 设计作品表
CREATE TABLE IF NOT EXISTS t_design (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    cover_image VARCHAR(500),
    design_data LONGTEXT COMMENT '图纸数据JSON',
    status VARCHAR(20) DEFAULT 'DRAFT',
    like_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 图纸市场表
CREATE TABLE IF NOT EXISTS t_pattern_listing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '发布者',
    design_id BIGINT COMMENT '关联的设计ID',
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price DECIMAL(10,2) DEFAULT 0.00,
    is_free TINYINT DEFAULT 1,
    `cols` INT DEFAULT 9,
    `rows` INT DEFAULT 9,
    preview_data LONGTEXT COMMENT '预览图纸数据JSON',
    downloads INT DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 5.0,
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE/OFFLINE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_is_free (is_free)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 图纸购买记录
CREATE TABLE IF NOT EXISTS t_pattern_purchase (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_user_listing (user_id, listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 社区动态表
CREATE TABLE IF NOT EXISTS t_feed (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    design_id BIGINT COMMENT '关联的设计作品',
    tags VARCHAR(500) COMMENT '标签，逗号分隔',
    media_urls TEXT COMMENT '媒体 URL 列表，逗号分隔',
    media_type VARCHAR(10) COMMENT 'image / gif / video',
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_like_count (like_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- 老库升级
ALTER TABLE t_feed ADD COLUMN media_urls TEXT;
ALTER TABLE t_feed ADD COLUMN media_type VARCHAR(10);
ALTER TABLE t_feed ADD INDEX idx_like_count (like_count);

-- 点赞表
CREATE TABLE IF NOT EXISTS t_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL COMMENT 'DESIGN/FEED/PATTERN',
    target_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_user_target (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS t_favorite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL COMMENT 'DESIGN/PATTERN',
    target_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_user_target (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 关注表
CREATE TABLE IF NOT EXISTS t_follow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_follower_following (follower_id, following_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS t_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL COMMENT 'DESIGN/FEED',
    target_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT COMMENT '回复的评论ID',
    like_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_target (target_type, target_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- 老库升级：保证 like_count 列存在（init.continue-on-error=true 失败也无碍）
ALTER TABLE t_comment ADD COLUMN like_count INT DEFAULT 0;

-- 材料商品表
CREATE TABLE IF NOT EXISTS t_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    sales INT DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 5.0,
    tag VARCHAR(20),
    color VARCHAR(20),
    icon VARCHAR(50),
    category VARCHAR(50),
    specs TEXT COMMENT '规格JSON数组',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS t_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/PAID/SHIPPED/COMPLETED/CANCELLED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- API密钥配置表（存储第三方API密钥，防止泄露到客户端）
CREATE TABLE IF NOT EXISTS t_api_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE COMMENT '配置项名称',
    config_value VARCHAR(500) NOT NULL COMMENT '配置值（API Key等）',
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 拼豆币钱包
CREATE TABLE IF NOT EXISTS t_wallet (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance INT DEFAULT 0 COMMENT '拼豆币余额',
    total_charged INT DEFAULT 0 COMMENT '累计充值',
    total_spent INT DEFAULT 0 COMMENT '累计消费',
    version INT DEFAULT 0 COMMENT '乐观锁版本号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 拼豆币流水
CREATE TABLE IF NOT EXISTS t_wallet_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount INT NOT NULL COMMENT '正=收入 负=支出',
    balance_after INT NOT NULL COMMENT '变动后余额',
    type VARCHAR(30) NOT NULL COMMENT 'CHARGE/BUY_PATTERN/BUY_PRODUCT/REWARD',
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单明细表
CREATE TABLE IF NOT EXISTS t_order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收货地址
CREATE TABLE IF NOT EXISTS t_address (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    receiver VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    region VARCHAR(100) NOT NULL COMMENT '省市区组合文本',
    detail VARCHAR(500) NOT NULL,
    tag VARCHAR(20) COMMENT '家 / 公司 等',
    is_default TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 反馈工单
CREATE TABLE IF NOT EXISTS t_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'FEATURE / ORDER / SUGGESTION',
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PROCESSING' COMMENT 'PROCESSING / WAITING / COMPLETED',
    screenshots TEXT COMMENT 'JSON 数组：附图 URL 列表',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 反馈工单回复
CREATE TABLE IF NOT EXISTS t_feedback_reply (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedback_id BIGINT NOT NULL,
    from_role VARCHAR(10) NOT NULL COMMENT 'USER / STAFF',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_feedback_id (feedback_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 发现页 banner（首页轮播 / 大卡片）
CREATE TABLE IF NOT EXISTS t_discover_banner (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    sub VARCHAR(200) COMMENT '副标题',
    pi INT DEFAULT 0 COMMENT '关联图案下标',
    bg VARCHAR(20) COMMENT '背景色 hex',
    cat VARCHAR(50) COMMENT '关联分类，可空',
    sort_mode VARCHAR(20) DEFAULT 'hot' COMMENT 'hot / latest',
    sort_order INT DEFAULT 0 COMMENT '排序权重，小的在前',
    eyebrow VARCHAR(50) COMMENT '上方小标题',
    button_text VARCHAR(50) COMMENT '按钮文案',
    text_color VARCHAR(20) COMMENT '文字色 hex，可空',
    enabled TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_enabled_order (enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 发现页过滤 tab
CREATE TABLE IF NOT EXISTS t_discover_tab (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tab_key VARCHAR(50) NOT NULL UNIQUE COMMENT '前端用 key, e.g. all/animal',
    label VARCHAR(50) NOT NULL,
    banner_ids VARCHAR(200) COMMENT '关联 banner id 列表，逗号分隔',
    categories VARCHAR(200) COMMENT '关联分类列表，逗号分隔',
    access_modes VARCHAR(100) COMMENT 'free/points/member 列表，逗号分隔',
    sort_mode VARCHAR(20) DEFAULT 'hot' COMMENT 'hot / latest',
    sort_order INT DEFAULT 0,
    result_title VARCHAR(100),
    empty_text VARCHAR(200),
    search_placeholder VARCHAR(100),
    is_default TINYINT DEFAULT 0 COMMENT '默认选中 tab，应该只有 1 条为 1',
    enabled TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_enabled_order (enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 通用字典表（订单状态文案 / 工单类型 / 工单状态 / 钱包流水类型 等）
CREATE TABLE IF NOT EXISTS t_dict (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dict_type VARCHAR(50) NOT NULL COMMENT 'ORDER_STATUS_NOTE / FEEDBACK_TYPE / FEEDBACK_STATUS / WALLET_LOG_TYPE',
    dict_key VARCHAR(50) NOT NULL COMMENT '英文枚举值，如 PENDING / FEATURE / CHARGE',
    label VARCHAR(100) COMMENT '中文显示名',
    description VARCHAR(500) COMMENT '长文案，如订单状态说明',
    sort_order INT DEFAULT 0,
    enabled TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_type_key (dict_type, dict_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 发现页全局配置（单行）
CREATE TABLE IF NOT EXISTS t_discover_setting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value VARCHAR(500),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 通知
CREATE TABLE IF NOT EXISTS t_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'SYSTEM / ORDER / INTERACT / LIKE / FOLLOW / MENTION / COMMENT',
    title VARCHAR(100) NOT NULL,
    content VARCHAR(500),
    unread TINYINT DEFAULT 1,
    action_type VARCHAR(30) COMMENT 'orders / orderDetail / likes / wallet / settings',
    action_payload VARCHAR(500) COMMENT 'JSON 参数如 { "orderId": "...", "tab": "..." }',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_id, type),
    INDEX idx_user_unread (user_id, unread)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 弹幕（图纸/作品详情页飘屏评论）
CREATE TABLE IF NOT EXISTS t_danmaku (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    design_id BIGINT NOT NULL,
    user_id BIGINT,
    text VARCHAR(80) NOT NULL,
    color VARCHAR(20) DEFAULT '#ffffff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_design_id (design_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 私信会话
CREATE TABLE IF NOT EXISTS t_dm_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_a_id BIGINT NOT NULL COMMENT '会话发起方/字典序较小的一方',
    user_b_id BIGINT NOT NULL COMMENT '另一方',
    last_content VARCHAR(500),
    last_at DATETIME,
    unread_a INT DEFAULT 0 COMMENT 'user_a 未读数',
    unread_b INT DEFAULT 0 COMMENT 'user_b 未读数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_pair (user_a_id, user_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 私信内容
CREATE TABLE IF NOT EXISTS t_dm_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    from_user_id BIGINT NOT NULL,
    to_user_id BIGINT NOT NULL,
    content VARCHAR(2000) NOT NULL,
    attachment VARCHAR(20) COMMENT 'photo / gif / null',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_to_user (to_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 官方推送（系统/活动）
CREATE TABLE IF NOT EXISTS t_official_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(20) NOT NULL COMMENT 'OFFICIAL / ACTIVITY',
    title VARCHAR(100) NOT NULL,
    content VARCHAR(500),
    icon VARCHAR(40) COMMENT 'feather icon name',
    color VARCHAR(20),
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    enabled TINYINT DEFAULT 1,
    deleted INT DEFAULT 0,
    INDEX idx_channel_pub (channel, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 登录设备
CREATE TABLE IF NOT EXISTS t_user_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(80) NOT NULL COMMENT '客户端稳定标识，登录时由前端生成或后端 hash(UA+IP)',
    device_name VARCHAR(80) COMMENT '如 iPhone 15 Pro',
    device_meta VARCHAR(200) COMMENT '城市 / 时间 等附属信息',
    is_current TINYINT DEFAULT 0,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_user_device (user_id, device_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户黑名单
CREATE TABLE IF NOT EXISTS t_user_blacklist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT NOT NULL,
    blocked_user_id BIGINT NOT NULL,
    reason VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_owner_blocked (owner_user_id, blocked_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- UI 配置（首页 tools / menus / create options / order tabs / feedback colors 等前端展示常量）
CREATE TABLE IF NOT EXISTS t_ui_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(80) NOT NULL UNIQUE COMMENT '如 create.sizes / mine.tools / community.tabs',
    config_value LONGTEXT NOT NULL COMMENT 'JSON 字符串',
    description VARCHAR(200),
    sort_order INT DEFAULT 0,
    enabled TINYINT DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
