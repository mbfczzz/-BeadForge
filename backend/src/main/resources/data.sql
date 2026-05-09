-- BeadForge 初始数据
USE beadforge;


-- 用户数据（密码都是 bcrypt 加密的 "123456"）
INSERT IGNORE INTO t_user (id, username, password, nickname, email) VALUES
(1, 'beadlover', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '拼豆爱好者', 'beadlover@test.com'),
(2, 'xiaodouzi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '小豆子', NULL),
(3, 'pindoudaren', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '拼豆达人', NULL),
(4, 'youximi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '游戏迷', NULL),
(5, 'huahua', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '花花世界', NULL),
(6, 'xingkong', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '星空漫步', NULL),
(7, 'shuiguo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '水果控', NULL),
(8, 'zhubaoj', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '珠宝匠', NULL),
(9, 'caihongqiao', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '彩虹桥', NULL),
(10, 'shouzuodaren', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z6FZV0.mOiZnfPfLqHU1DXTK', '手作达人', NULL);

-- 设计作品
INSERT IGNORE INTO t_design (id, user_id, title, description, category, status, like_count, view_count, created_at) VALUES
(1, 2, '像素爱心', '经典红色爱心图案', '抽象', 'PUBLISHED', 328, 1200, '2026-04-01'),
(2, 3, '橘猫咪咪', '超萌橘猫正面照', '动物', 'PUBLISHED', 512, 2100, '2026-04-02'),
(3, 4, '超级蘑菇', '马里奥经典红蘑菇还原', '卡通', 'PUBLISHED', 445, 1800, '2026-04-03'),
(4, 5, '粉色小花', '春日樱花主题拼豆', '花卉', 'PUBLISHED', 267, 900, '2026-04-03'),
(5, 6, '闪耀金星', '五角星经典造型', '抽象', 'PUBLISHED', 189, 750, '2026-04-04'),
(6, 7, '双子樱桃', '可爱的樱桃拼豆挂件', '美食', 'PUBLISHED', 376, 1400, '2026-04-05'),
(7, 8, '冰蓝钻石', '闪闪发光的钻石造型', '抽象', 'PUBLISHED', 298, 1100, '2026-04-05'),
(8, 9, '七色彩虹', '经典彩虹拱门图案', '风景', 'PUBLISHED', 421, 1600, '2026-04-06'),
(9, 2, '迷你爱心钥匙扣', '可以做成钥匙扣的小爱心', '抽象', 'PUBLISHED', 156, 600, '2026-04-06'),
(10, 3, '黑猫警长', '帅气的黑色小猫', '动物', 'PUBLISHED', 534, 2300, '2026-04-07'),
(11, 10, '红蘑菇小屋', '童话里的蘑菇房子', '卡通', 'PUBLISHED', 312, 1300, '2026-04-07'),
(12, 5, '太阳花', '向日葵主题拼豆杯垫', '花卉', 'PUBLISHED', 278, 1050, '2026-04-08'),
(13, 6, '8-bit 星星', '复古游戏风星星', '像素', 'PUBLISHED', 198, 820, '2026-04-08'),
(14, 7, '草莓蛋糕', '超可爱的草莓蛋糕造型', '美食', 'PUBLISHED', 467, 1900, '2026-04-09'),
(15, 9, '日落渐变', '橙紫色渐变日落风景', '风景', 'PUBLISHED', 356, 1500, '2026-04-09'),
(16, 2, '皮卡丘', '经典宝可梦皮卡丘造型', '卡通', 'PUBLISHED', 689, 3200, '2026-04-10'),
(17, 10, '四叶草', '幸运四叶草挂饰', '花卉', 'PUBLISHED', 234, 980, '2026-04-10'),
(18, 3, '三花猫', '超萌三花猫正面像', '动物', 'PUBLISHED', 412, 1700, '2026-04-10'),
(19, 8, '紫水晶', '高贵的紫色宝石', '抽象', 'PUBLISHED', 187, 720, '2026-04-11'),
(20, 3, '西瓜片', '夏日清凉西瓜造型', '美食', 'PUBLISHED', 523, 2400, '2026-04-11');

-- 材料商品
INSERT IGNORE INTO t_product (id, name, description, price, original_price, sales, rating, tag, color, icon, category, specs) VALUES
(1, '5mm标准珠·48色套装', '约24000颗入门必备', 29.90, 49.90, 8234, 4.8, '爆款', '#EF4444', 'box', '珠子', '["5mm直径","48色","约24000颗","含收纳盒"]'),
(2, '迷你珠2.6mm·72色', '精细图案专用', 45.00, NULL, 3421, 4.9, NULL, '#8B5CF6', 'box', '珠子', '["2.6mm直径","72色","约36000颗","含分色盒"]'),
(3, '大号拼豆板29×29', '透明白可拼接', 8.90, 12.00, 12500, 4.7, '热销', '#3B82F6', 'layout', '拼豆板', '["29×29格","透明白","可拼接"]'),
(4, '六角拼豆板', '六边形创意造型', 6.50, NULL, 5600, 4.6, NULL, '#22C55E', 'hexagon', '拼豆板', '["六角形","透明","边长15cm"]'),
(5, '尖头镊子', '不锈钢精准夹取', 5.90, NULL, 9870, 4.8, NULL, '#F97316', 'tool', '工具', '["不锈钢","尖头","防滑握柄"]'),
(6, '熨烫专用烫纸50张', '耐高温不粘珠', 3.50, 5.00, 15600, 4.5, '必买', '#EC4899', 'file', '配件', '["50张","耐高温","15×15cm"]'),
(7, '新手入门套装', '珠子+板+镊子+烫纸', 39.90, 68.00, 6700, 4.9, '推荐', '#0EA5E9', 'package', '套装', '["24色珠子","拼豆板×2","镊子×1","烫纸×10"]'),
(8, '夜光珠12色', '暗处持续发光', 19.90, NULL, 2100, 4.4, NULL, '#FBBF24', 'sun', '珠子', '["12色","5mm","约6000颗"]'),
(9, '钥匙扣配件50个', '含链+环+螺丝柱', 9.90, NULL, 7800, 4.6, NULL, '#6B7280', 'key', '配件', '["50套","金属材质"]'),
(10, '收纳盒36格', '透明盖分色收纳', 15.90, 22.00, 5100, 4.7, NULL, '#F87171', 'archive', '工具', '["36格","透明盖","27×17cm"]');

-- 图纸市场
INSERT IGNORE INTO t_pattern_listing (id, user_id, title, description, category, price, is_free, `cols`, `rows`, downloads, rating, created_at) VALUES
(1, 2, '像素爱心', '经典红色爱心，新手入门首选', '抽象', 0, 1, 10, 9, 3280, 4.9, '2026-04-01'),
(2, 3, '橘猫咪咪', '超萌橘猫正面照', '动物', 2.90, 0, 9, 8, 2100, 4.8, '2026-04-02'),
(3, 4, '超级蘑菇', '马里奥经典红蘑菇', '卡通', 1.90, 0, 10, 9, 1800, 4.7, '2026-04-03'),
(4, 5, '粉色小花', '春日樱花主题', '花卉', 0, 1, 9, 10, 900, 4.6, '2026-04-03'),
(5, 6, '闪耀金星', '五角星经典造型', '抽象', 1.50, 0, 9, 9, 750, 4.5, '2026-04-04'),
(6, 7, '双子樱桃', '可爱的樱桃挂件', '美食', 0, 1, 9, 8, 1400, 4.7, '2026-04-05'),
(7, 8, '冰蓝钻石', '钻石造型', '抽象', 3.90, 0, 9, 7, 1100, 4.8, '2026-04-05'),
(8, 9, '七色彩虹', '经典彩虹，7种颜色', '像素', 1.90, 0, 9, 7, 1600, 4.9, '2026-04-06');

-- 社区动态
INSERT IGNORE INTO t_feed (id, user_id, content, design_id, tags, like_count, comment_count, share_count, created_at) VALUES
(1, 2, '第一次尝试做橘猫，熨烫的时候差点烫歪了 😂 不过最终效果还不错！分享给大家~', 2, '猫咪,新手', 128, 23, 5, '2026-04-12 10:00:00'),
(2, 6, '用 AI 生成了一个星空主题的图案，然后手动调整了配色。AI + 手工 = 完美搭配！', 5, 'AI创作,星空', 256, 41, 18, '2026-04-12 09:00:00'),
(3, 5, '春天来了，做了一朵小花送给妈妈当胸针 🌸 她超开心的！', 4, '花卉,礼物', 342, 56, 12, '2026-04-12 07:00:00'),
(4, 4, '马里奥蘑菇完成！用了两种红色做渐变，比单色版好看多了。下一个目标：做一套完整角色~', 3, '游戏,马里奥', 189, 34, 8, '2026-04-11 14:00:00'),
(5, 9, '给闺蜜做了一对樱桃耳环，用 2.6mm 迷你珠，精致到哭！配件用的是市场上买的 S925 耳钩', 6, '饰品,耳环', 467, 89, 31, '2026-04-11 10:00:00'),
(6, 8, '宝石拼豆第一弹！蓝色钻石搞定✨ 接下来挑战红宝石', 7, '宝石,新手', 95, 12, 3, '2026-04-11 08:00:00'),
(7, 9, '彩虹挂画完成了！这个用了快 600 颗珠子，7 种颜色。推荐新手从这个练起，配色简单效果好。', 8, '彩虹,教程', 521, 78, 45, '2026-04-10 12:00:00');

-- API配置（注意：明文 key 不应长期留在 repo 里，建议在 admin / 直接 SQL 中维护）
INSERT IGNORE INTO t_api_config (config_key, config_value, description) VALUES
('ai_image_api_key', 'sk-rngt2ULWyyM0uVWz3KTluZLElSgIx9Ij0BcwlOjegbTxlDy6', 'AI 文生图 API Key'),
('ai_image_model', 'gpt-image-2', 'AI 文生图模型 ID'),
('ai_image_base_url', 'https://www.uocode.com/v1', 'AI 文生图 API 地址'),
('ai_vision_model', 'gpt-4o-mini', 'AI 视觉模型 ID（图片转拼豆 AI 增强用，看图写描述）'),
('hot_like_weight', '3', '热度算法-点赞权重'),
('hot_view_weight', '1', '热度算法-浏览权重'),
('recommend_new_ratio', '0.3', '推荐-新作品占比'),
('recommend_hot_ratio', '0.7', '推荐-热门作品占比'),
('wechat_app_id', '', '微信支付-AppID'),
('wechat_mch_id', '', '微信支付-商户号'),
('wechat_api_key', '', '微信支付-APIv3密钥'),
('alipay_app_id', '', '支付宝-AppID'),
('alipay_private_key', '', '支付宝-应用私钥'),
('alipay_public_key', '', '支付宝-支付宝公钥'),
('payment_enabled', 'false', '是否开启真实支付(false=模拟)'),
('coin_rate', '1', '拼豆币兑换率(1元=N拼豆币)');

-- 一些关注关系
INSERT IGNORE INTO t_follow (follower_id, following_id) VALUES
(1, 2), (1, 3), (1, 9),
(2, 3), (2, 5),
(3, 2), (3, 9);

-- ═══════ 增量迁移：为已有表补充新字段 ═══════

-- 用户表加角色字段（已存在则跳过）
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_user' AND COLUMN_NAME='role');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_user ADD COLUMN role VARCHAR(16) DEFAULT ''USER'' COMMENT ''角色: USER / ADMIN''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 钱包表加乐观锁版本号（已存在则跳过）
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_wallet' AND COLUMN_NAME='version');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_wallet ADD COLUMN version INT DEFAULT 0 COMMENT ''乐观锁版本号''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 用户资料扩展字段（bio / gender / birthday / education / occupation）— 前端 EditProfile 需要
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_user' AND COLUMN_NAME='bio');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_user ADD COLUMN bio VARCHAR(300) COMMENT ''个人简介''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_user' AND COLUMN_NAME='gender');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_user ADD COLUMN gender VARCHAR(10) COMMENT ''male/female/other''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_user' AND COLUMN_NAME='birthday');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_user ADD COLUMN birthday VARCHAR(10) COMMENT ''YYYY-MM-DD''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_user' AND COLUMN_NAME='education');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_user ADD COLUMN education VARCHAR(50) COMMENT ''学历/教育''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='beadforge' AND TABLE_NAME='t_user' AND COLUMN_NAME='occupation');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE t_user ADD COLUMN occupation VARCHAR(50) COMMENT ''职业''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 确保 test1 用户有 ADMIN 角色（方便管理后台登录）
UPDATE t_user SET role = 'ADMIN' WHERE username = 'test1' AND (role IS NULL OR role != 'ADMIN');

-- 切回 gpt-image-1 + uocode 代理（老库里 INSERT IGNORE 命中、值不会更新，必须显式
-- UPDATE 才能覆盖已有数据库）。同时迁 base_url / api_key 到 uocode。
-- 用户改 model 到非 dall-e-2 / gpt-image-1 的别的值，则视为有意保留，不动。
UPDATE t_api_config SET config_value = 'gpt-image-2' WHERE config_key = 'ai_image_model' AND config_value IN ('dall-e-2', 'dall-e-3', 'gpt-image-1');
UPDATE t_api_config SET config_value = 'https://www.uocode.com/v1' WHERE config_key = 'ai_image_base_url' AND config_value IN ('https://api.oaipro.com/v1');
UPDATE t_api_config SET config_value = 'sk-rngt2ULWyyM0uVWz3KTluZLElSgIx9Ij0BcwlOjegbTxlDy6' WHERE config_key = 'ai_image_api_key' AND config_value LIKE 'sk-Cb7P%';

-- ────────── Discovery 配置初始数据 ──────────
INSERT IGNORE INTO t_discover_banner (id, title, sub, pi, bg, cat, sort_mode, sort_order, eyebrow, button_text, enabled) VALUES
(1, '热门精选', '近期收藏和浏览都很高的图案',  0, '#4B78FF', NULL,   'hot',    1, '发现图纸', '立即查看', 1),
(2, '动物主题', '适合挂件和卡片的小尺寸作品',  1, '#D6B161', '动物', 'hot',    2, '发现图纸', '热门动物', 1),
(3, '花草系列', '贺卡和礼物封面常用花卉主题',  3, '#E986B5', '花草', 'latest', 3, '春季灵感', '最新上架', 1),
(4, '美食图纸', '杯垫、冰箱贴和摆台都很适合',  5, '#63A88B', '美食', 'hot',    4, '厨房灵感', '看看新品', 1);

INSERT IGNORE INTO t_discover_tab (id, tab_key, label, banner_ids, categories, sort_mode, sort_order, result_title, empty_text, is_default, enabled) VALUES
(1, 'all',    '全部', '1,2,3,4', NULL,   'hot',    1, '为你推荐', '暂无推荐图纸',     1, 1),
(2, 'animal', '动物', '2',       '动物', 'hot',    2, '动物推荐', '暂无动物主题图纸', 0, 1),
(3, 'flower', '花草', '3',       '花草', 'latest', 3, '花草推荐', '暂无花草主题图纸', 0, 1),
(4, 'food',   '美食', '4',       '美食', 'hot',    4, '美食推荐', '暂无美食主题图纸', 0, 1);

INSERT IGNORE INTO t_discover_setting (config_key, config_value) VALUES
('searchPlaceholder', '搜索图纸、作者或分类'),
('resultTitle',       '为你推荐'),
('emptyText',         '暂无匹配的图纸资源');

-- ────────── 字典数据 ──────────
-- 订单状态长文案（OrderDTO.buildStatusNote）
INSERT IGNORE INTO t_dict (dict_type, dict_key, label, description, sort_order) VALUES
('ORDER_STATUS_NOTE', 'PENDING',   '待支付',     '订单已创建，请尽快完成支付。',                 1),
('ORDER_STATUS_NOTE', 'PAID',      '待发货',     '商家正在备货，预计 24 小时内出库。',           2),
('ORDER_STATUS_NOTE', 'SHIPPED',   '待收货',     '包裹运输中，请留意物流信息。',                 3),
('ORDER_STATUS_NOTE', 'COMPLETED', '已完成',     '订单已完成，欢迎再次购买。',                   4),
('ORDER_STATUS_NOTE', 'CANCELLED', '已取消',     '订单已取消。',                                 5),
('ORDER_STATUS_NOTE', 'REFUND',    '退款/售后', '售后申请已提交，平台正在处理中。',             6);

-- 工单类型映射（FeedbackDTO.typeToCn / typeToEn）
INSERT IGNORE INTO t_dict (dict_type, dict_key, label, sort_order) VALUES
('FEEDBACK_TYPE',   'FEATURE',    '功能问题', 1),
('FEEDBACK_TYPE',   'ORDER',      '订单问题', 2),
('FEEDBACK_TYPE',   'SUGGESTION', '体验建议', 3);

-- 工单状态映射（FeedbackDTO.statusToCn）
INSERT IGNORE INTO t_dict (dict_type, dict_key, label, sort_order) VALUES
('FEEDBACK_STATUS', 'PROCESSING', '处理中', 1),
('FEEDBACK_STATUS', 'WAITING',    '待回复', 2),
('FEEDBACK_STATUS', 'COMPLETED',  '已完成', 3);

-- 钱包流水类型映射（WalletController.typeToCn）
INSERT IGNORE INTO t_dict (dict_type, dict_key, label, sort_order) VALUES
('WALLET_LOG_TYPE', 'CHARGE',       '账户充值', 1),
('WALLET_LOG_TYPE', 'BUY_PATTERN',  '购买图纸', 2),
('WALLET_LOG_TYPE', 'BUY_PRODUCT',  '购买商品', 3),
('WALLET_LOG_TYPE', 'REWARD',       '奖励到账', 4),
('WALLET_LOG_TYPE', 'SIGN_IN',      '每日签到', 5);

-- ────────── 通知种子（5 类 quick-entry 各放一条，user_id=1） ──────────
INSERT IGNORE INTO t_notification (id, user_id, type, title, content, unread, action_type, created_at) VALUES
(1001, 1, 'COMMENT', '像素研究所 评论了你', '这个边缘处理太干净了，配色也很适合做成动图封面。',     1, NULL, '2026-04-26 09:50:00'),
(1002, 1, 'COMMENT', '木木手作 评论了你',   '第二张参考图更有层次，建议保留透明珠的高光。',           1, NULL, '2026-04-26 09:00:00'),
(1003, 1, 'LIKE',    '木木手作 赞了你的作品', '《像素花束卡片》收到了新的点赞。',                       1, 'likes', '2026-04-26 08:30:00'),
(1004, 1, 'LIKE',    '饰品工作室 收藏了你的动态', '多图参考被加入灵感收藏夹。',                            0, NULL, '2026-04-25 21:00:00'),
(1005, 1, 'FOLLOW',  '编织研究室 关注了你', '你们现在可以互相查看动态更新。',                           1, NULL, '2026-04-26 09:55:00'),
(1006, 1, 'FOLLOW',  '小珠设计 关注了你',   '对方常发布原创串珠配色。',                                 0, NULL, '2026-04-26 06:20:00'),
(1007, 1, 'ORDER',   '订单待支付提醒',     '72 色拼豆新手套装订单尚未支付，库存将为你保留 24 小时。',  1, 'orders', '2026-04-26 09:58:00'),
(1008, 1, 'ORDER',   '商品已发货',         '5mm 标准珠 48 色补充包已发货，物流正在揽收中。',           0, 'orders', '2026-04-26 09:38:00'),
(1009, 1, 'MENTION', '像素研究所 提到了你', '在「边缘修图技巧」动态中 @ 了你。',                        1, NULL, '2026-04-26 09:35:00');

-- ────────── 官方推送种子 ──────────
INSERT IGNORE INTO t_official_message (id, channel, title, content, icon, color, published_at, enabled) VALUES
(1, 'OFFICIAL', '官方消息', '您的账号安全状态正常，新的社区创作规范已更新。', 'volume-2', '#3B82F6', '2026-04-20 10:00:00', 1),
(2, 'ACTIVITY', '活动消息', '春日串珠灵感征集开启，发布作品可获得限定徽章。',     'gift',     '#F59E0B', '2026-04-26 09:20:00', 1);

-- ────────── 弹幕种子（关联到 design_id=1，用于详情页演示） ──────────
INSERT IGNORE INTO t_danmaku (design_id, user_id, text, color) VALUES
(1, 1, '这个配色很舒服',          '#fff'),
(1, 1, '这组结构适合新手练习',    '#ffe066'),
(1, 1, '先收藏，周末试做',        '#7dd3fc'),
(1, 1, '边缘处理得很干净',        '#fff'),
(1, 1, '想看完整步骤',            '#fca5a5'),
(1, 1, '原来拼豆还能这样组合',    '#86efac'),
(1, 1, '适合做成钥匙扣',          '#fff'),
(1, 1, '这张图纸需要多大板子',    '#c4b5fd'),
(1, 1, '颜色层次很稳定',          '#fda4af'),
(1, 1, '成品发出来看看',          '#fff'),
(1, 1, '这个主题很适合送礼',      '#fde68a'),
(1, 1, '我试过一次，还想再优化',  '#7dd3fc'),
(1, 1, '整体节奏很顺',            '#fff'),
(1, 1, '这个尺寸刚刚好',          '#86efac'),
(1, 1, '创意方向不错',            '#c4b5fd');

-- ────────── UI 配置种子（前端启动时一次拉取） ──────────
INSERT IGNORE INTO t_ui_config (config_key, config_value, description, sort_order) VALUES
('create.sizes',
 '[{"label":"小","cols":9,"rows":9,"desc":"钥匙扣","icon":"key"},{"label":"中","cols":16,"rows":16,"desc":"杯垫","icon":"coffee"},{"label":"大","cols":32,"rows":32,"desc":"挂画 / 摆件","icon":"image"},{"label":"肖像","cols":48,"rows":48,"desc":"人像 / 头像","icon":"user"},{"label":"宽幅","cols":48,"rows":24,"desc":"书签 / 横幅","icon":"bookmark"},{"label":"巨幅","cols":64,"rows":64,"desc":"挂画大件","icon":"layout"}]',
 '创作页画布尺寸选项', 1),
('create.methods',
 '[{"key":"manual","icon":"edit-2","title":"手动创作","desc":"逐颗放置珠子并手动调整结构。","color":"#4B78FF"},{"key":"image","icon":"image","title":"图片转换","desc":"从照片生成基础拼豆图纸。","color":"#F97316"},{"key":"ai","icon":"cpu","title":"AI 生成","desc":"根据描述生成可继续编辑的草稿。","color":"#8B5CF6"}]',
 '创作页方式选项', 2),
('create.tips',
 '[{"icon":"grid","title":"从规则图形开始","desc":"圆形、爱心和字母更容易控制结构。","bg":"#EEF2FF","mode":"manual"},{"icon":"camera","title":"先选高对比图片","desc":"主体清晰的照片转换成功率更高。","bg":"#FEF3C7","mode":"image"},{"icon":"cpu","title":"先写清尺寸和用途","desc":"描述里带尺寸和场景，更容易得到可用草稿。","bg":"#F3E8FF","mode":"ai"}]',
 '创作页提示卡片', 3),
('mine.headerActions',
 '[{"id":"notifications","label":"消息","icon":"message-circle","actionKey":"notifications"},{"id":"settings","label":"设置","icon":"settings","actionKey":"settings"}]',
 '我的页右上角操作', 4),
('mine.tools',
 '[{"id":"designs","label":"我的作品","icon":"grid","iconTint":"#2563EB","iconBackground":"#E0ECFF","actionKey":"myDesigns"},{"id":"posts","label":"我的发布","icon":"radio","iconTint":"#0F9E8A","iconBackground":"#DBF6F1","actionKey":"myFeeds"},{"id":"likes","label":"我的点赞","icon":"heart","iconTint":"#E5486D","iconBackground":"#FFE4EB","actionKey":"likes"},{"id":"favorites","label":"我的收藏","icon":"star","iconTint":"#F59E0B","iconBackground":"#FFF1CF","actionKey":"favorites"},{"id":"history","label":"浏览记录","icon":"clock","iconTint":"#6366F1","iconBackground":"#E6E8FF","actionKey":"likedHistory"},{"id":"orders","label":"已购资源","icon":"shopping-bag","iconTint":"#7C3AED","iconBackground":"#EFE3FF","actionKey":"purchased"},{"id":"wallet","label":"积分钱包","icon":"award","iconTint":"#0EA5E9","iconBackground":"#DFF5FF","actionKey":"wallet"},{"id":"notices","label":"通知中心","icon":"bell","iconTint":"#334155","iconBackground":"#E7EDF7","actionKey":"notifications"}]',
 '我的页快捷工具网格', 5),
('mine.orderShortcuts',
 '[{"id":"pending-payment","label":"待付款","icon":"credit-card","actionKey":"orders","orderTab":"待支付"},{"id":"pending-shipping","label":"待发货","icon":"package","actionKey":"orders","orderTab":"待发货"},{"id":"pending-receipt","label":"待收货","icon":"truck","actionKey":"orders","orderTab":"待收货"},{"id":"completed","label":"已完成","icon":"check-circle","actionKey":"orders"},{"id":"after-sale","label":"售后","icon":"rotate-ccw","actionKey":"orders","orderTab":"退款/售后"}]',
 '我的页订单状态快捷入口', 6),
('mine.menus',
 '[{"id":"addresses","label":"收货地址管理","description":"管理常用地址、默认收件人与联系电话","icon":"map-pin","actionKey":"addresses"},{"id":"tutorial","label":"使用教程","description":"查看新手指南、制作流程与功能操作说明","icon":"book-open","actionKey":"tutorial"},{"id":"feedback","label":"帮助与反馈","description":"提交问题、查看工单进度或联系支持团队","icon":"help-circle","actionKey":"feedback"}]',
 '我的页底部菜单', 7),
('community.tabs', '["推荐","关注","最新"]', '社区页 tab', 8),
('profile.tabs',
 '[{"label":"作品","icon":"view-grid-outline","iconActive":"view-grid"},{"label":"动态","icon":"text-box-outline","iconActive":"text-box"},{"label":"喜欢","icon":"heart-outline","iconActive":"heart"}]',
 '用户主页 tab', 9),
('feedback.ticketTypes', '["功能问题","订单问题","体验建议"]', '工单类型选项', 10),
('feedback.statusColors',
 '{"处理中":"#2563EB","待回复":"#F59E0B","已完成":"#10B981"}',
 '工单状态颜色映射', 11),
('profile.orderTabs',
 '[{"key":"全部","label":"全部"},{"key":"待支付","label":"待支付"},{"key":"待发货","label":"待发货"},{"key":"待收货","label":"待收货"},{"key":"退款/售后","label":"退款/售后"},{"key":"已完成","label":"已完成"}]',
 '订单页 tab', 12),
('profile.orderStatusMeta',
 '{"待支付":{"color":"#F59E0B","soft":"#FFF4DE","border":"#F7D7A0","icon":"clock"},"待发货":{"color":"#3B82F6","soft":"#EAF3FF","border":"#CCE0FF","icon":"package"},"待收货":{"color":"#10B981","soft":"#E8FBF4","border":"#BCEFD9","icon":"truck"},"退款/售后":{"color":"#EF4444","soft":"#FFE8EA","border":"#FFC7CC","icon":"rotate-ccw"},"已完成":{"color":"#94A3B8","soft":"#F3F6FA","border":"#D6E0EA","icon":"check-circle"}}',
 '订单状态颜色与图标', 13),
('notifications.quickEntries',
 '[{"key":"comments","label":"所有评论","icon":"comment-text-outline","color":"#6366F1"},{"key":"likes","label":"赞和收藏","icon":"heart-outline","color":"#EF476F"},{"key":"follows","label":"关注消息","icon":"account-plus-outline","color":"#22C55E"},{"key":"orders","label":"订单消息","icon":"package-variant-closed","color":"#F59E0B"},{"key":"mentions","label":"@我的","icon":"at","color":"#06A6C8"}]',
 '通知页快捷分类', 14);
