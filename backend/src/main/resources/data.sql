-- BeadForge 初始数据
USE beadforge;

-- 修复缺失的 deleted 字段
ALTER TABLE t_api_config ADD COLUMN IF NOT EXISTS deleted INT DEFAULT 0;
ALTER TABLE t_wallet ADD COLUMN IF NOT EXISTS deleted INT DEFAULT 0;
ALTER TABLE t_wallet_log ADD COLUMN IF NOT EXISTS deleted INT DEFAULT 0;

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

-- API配置
INSERT IGNORE INTO t_api_config (config_key, config_value, description) VALUES
('doubao_api_key', 'aa74c59c-9d1d-46b2-a8c1-b1bacb1997cc', '豆包文生图 API Key'),
('doubao_model', 'doubao-seedream-5-0-260128', '豆包文生图模型ID'),
('doubao_base_url', 'https://ark.cn-beijing.volces.com/api/v3', '豆包API地址'),
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
