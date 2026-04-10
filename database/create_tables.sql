-- ============================================
-- 旅行规划助手 - 数据库表结构
-- 创建时间：2026-04-10
-- 数据库：trip
-- ============================================

-- 1. 行程表
CREATE TABLE `trips` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '行程ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `trip_name` varchar(255) NOT NULL COMMENT '行程名称',
  `origin` varchar(255) DEFAULT NULL COMMENT '出发地',
  `destination` varchar(255) NOT NULL COMMENT '目的地',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `travelers` int(11) DEFAULT 1 COMMENT '旅行人数',
  `budget` decimal(10,2) DEFAULT NULL COMMENT '预算金额',
  `transport` varchar(50) DEFAULT NULL COMMENT '交通方式',
  `status` enum('planning','ongoing','completed','cancelled') DEFAULT 'planning' COMMENT '行程状态：规划中/进行中/已完成/已取消',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='行程表';

-- 2. 日程表
CREATE TABLE `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '日程ID',
  `trip_id` int(11) NOT NULL COMMENT '行程ID',
  `day_number` int(11) NOT NULL COMMENT '第几天',
  `date` date DEFAULT NULL COMMENT '日期',
  `morning_activity` text COMMENT '上午活动',
  `afternoon_activity` text COMMENT '下午活动',
  `evening_activity` text COMMENT '晚上活动',
  `notes` text COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_date` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='日程表';

-- 3. 支出表
CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '支出ID',
  `trip_id` int(11) NOT NULL COMMENT '行程ID',
  `category` enum('transport','accommodation','food','ticket','shopping','other') NOT NULL COMMENT '支出分类：交通/住宿/餐饮/门票/购物/其他',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `expense_date` date DEFAULT NULL COMMENT '支出日期',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_category` (`category`),
  KEY `idx_expense_date` (`expense_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='支出表';

-- 4. 景点收藏表
CREATE TABLE `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `poi_id` varchar(100) DEFAULT NULL COMMENT '景点ID（高德地图POI ID）',
  `poi_name` varchar(255) NOT NULL COMMENT '景点名称',
  `poi_address` varchar(500) DEFAULT NULL COMMENT '景点地址',
  `city` varchar(100) DEFAULT NULL COMMENT '城市',
  `poi_type` varchar(100) DEFAULT NULL COMMENT '景点类型',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_city` (`city`),
  UNIQUE KEY `idx_user_poi` (`user_id`,`poi_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='景点收藏表';

-- 5. 游记表
CREATE TABLE `travel_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '游记ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `trip_id` int(11) DEFAULT NULL COMMENT '关联行程ID（可选）',
  `title` varchar(255) NOT NULL COMMENT '游记标题',
  `content` longtext COMMENT '游记内容',
  `images` text COMMENT '图片URL列表（JSON格式）',
  `views` int(11) DEFAULT 0 COMMENT '浏览量',
  `likes` int(11) DEFAULT 0 COMMENT '点赞数',
  `is_public` tinyint(1) DEFAULT 1 COMMENT '是否公开：1-公开 0-私密',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_likes` (`likes`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='游记表';

-- 6. 提醒表
CREATE TABLE `reminders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '提醒ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `trip_id` int(11) DEFAULT NULL COMMENT '行程ID',
  `reminder_type` enum('departure','weather','schedule','custom') NOT NULL COMMENT '提醒类型：出发提醒/天气提醒/行程提醒/自定义',
  `reminder_time` datetime NOT NULL COMMENT '提醒时间',
  `content` varchar(500) DEFAULT NULL COMMENT '提醒内容',
  `is_sent` tinyint(1) DEFAULT 0 COMMENT '是否已发送：0-未发送 1-已发送',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_reminder_time` (`reminder_time`),
  KEY `idx_is_sent` (`is_sent`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='提醒表';

-- 7. 游记评论表
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `travel_log_id` int(11) NOT NULL COMMENT '游记ID',
  `user_id` int(11) NOT NULL COMMENT '评论用户ID',
  `content` text NOT NULL COMMENT '评论内容',
  `parent_id` int(11) DEFAULT NULL COMMENT '父评论ID（用于回复功能）',
  `likes` int(11) DEFAULT 0 COMMENT '点赞数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_travel_log_id` (`travel_log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='游记评论表';

-- 8. 游记点赞表
CREATE TABLE `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  `travel_log_id` int(11) NOT NULL COMMENT '游记ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_log` (`user_id`,`travel_log_id`),
  KEY `idx_travel_log_id` (`travel_log_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='游记点赞表';

-- 9. 验证码表（用于手机验证码登录）
CREATE TABLE `verification_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '验证码ID',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `code` varchar(6) NOT NULL COMMENT '验证码',
  `type` enum('login','register','reset_password') DEFAULT 'login' COMMENT '验证码类型',
  `is_used` tinyint(1) DEFAULT 0 COMMENT '是否已使用：0-未使用 1-已使用',
  `expires_at` timestamp NOT NULL COMMENT '过期时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='验证码表';

-- ============================================
-- 插入测试数据（可选）
-- ============================================

-- 插入测试行程数据
-- INSERT INTO `trips` (`user_id`, `trip_name`, `origin`, `destination`, `start_date`, `end_date`, `travelers`, `budget`, `transport`, `status`)
-- VALUES (1, '北京三日游', '上海', '北京', '2026-05-01', '2026-05-03', 2, 5000.00, 'high_speed_rail', 'planning');

-- 插入测试日程数据
-- INSERT INTO `schedules` (`trip_id`, `day_number`, `date`, `morning_activity`, `afternoon_activity`, `evening_activity`, `notes`)
-- VALUES (1, 1, '2026-05-01', '天安门广场、故宫博物院', '景山公园、北海公园', '王府井步行街', '记得带身份证');

-- 插入测试支出数据
-- INSERT INTO `expenses` (`trip_id`, `category`, `amount`, `description`, `expense_date`)
-- VALUES (1, 'transport', 553.00, '上海到北京高铁票', '2026-05-01');

-- ============================================
-- 查询视图（可选）
-- ============================================

-- 创建行程统计视图
CREATE OR REPLACE VIEW `v_trip_statistics` AS
SELECT 
    t.id AS trip_id,
    t.user_id,
    t.trip_name,
    t.destination,
    t.start_date,
    t.end_date,
    t.budget,
    t.status,
    COUNT(DISTINCT s.id) AS schedule_count,
    COUNT(DISTINCT e.id) AS expense_count,
    COALESCE(SUM(e.amount), 0) AS total_expense,
    (t.budget - COALESCE(SUM(e.amount), 0)) AS budget_remaining
FROM trips t
LEFT JOIN schedules s ON t.id = s.trip_id
LEFT JOIN expenses e ON t.id = e.trip_id
GROUP BY t.id;

-- 创建游记详情视图
CREATE OR REPLACE VIEW `v_travel_log_detail` AS
SELECT 
    tl.id,
    tl.user_id,
    u.name AS user_name,
    u.image_url AS user_avatar,
    tl.trip_id,
    t.trip_name,
    tl.title,
    tl.content,
    tl.images,
    tl.views,
    tl.likes,
    tl.is_public,
    tl.created_at,
    tl.updated_at,
    COUNT(DISTINCT c.id) AS comment_count
FROM travel_logs tl
LEFT JOIN users u ON tl.user_id = u.id
LEFT JOIN trips t ON tl.trip_id = t.id
LEFT JOIN comments c ON tl.id = c.travel_log_id
GROUP BY tl.id;
