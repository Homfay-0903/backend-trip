-- 修改 reminders 表结构以支持前端功能
-- 执行此脚本前请备份数据库

-- 1. 添加 title 字段
ALTER TABLE `reminders` ADD COLUMN `title` varchar(255) DEFAULT NULL COMMENT '提醒标题' AFTER `trip_id`;

-- 2. 修改 reminder_type 字段从 enum 改为 varchar
ALTER TABLE `reminders` MODIFY COLUMN `reminder_type` varchar(50) NOT NULL COMMENT '提醒类型';

-- 3. 重命名 content 字段为 description
ALTER TABLE `reminders` CHANGE COLUMN `content` `description` varchar(500) DEFAULT NULL COMMENT '提醒描述';

-- 4. 更新现有的提醒类型数据（将英文改为中文）
UPDATE `reminders` SET `reminder_type` = '出发' WHERE `reminder_type` = 'departure';
UPDATE `reminders` SET `reminder_type` = '天气' WHERE `reminder_type` = 'weather';
UPDATE `reminders` SET `reminder_type` = '行程' WHERE `reminder_type` = 'schedule';
UPDATE `reminders` SET `reminder_type` = '其他' WHERE `reminder_type` = 'custom';
