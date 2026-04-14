-- ============================================
-- 数据库迁移：为trips表添加天气和景点数据字段
-- 创建时间：2026-04-14
-- ============================================

-- 添加天气数据字段（JSON格式）
ALTER TABLE `trips` 
ADD COLUMN `weather_data` JSON DEFAULT NULL COMMENT '天气数据（JSON格式）' AFTER `transport`;

-- 添加景点数据字段（JSON格式）
ALTER TABLE `trips` 
ADD COLUMN `pois_data` JSON DEFAULT NULL COMMENT '景点数据（JSON格式）' AFTER `weather_data`;

-- 添加选中景点索引字段（JSON格式）
ALTER TABLE `trips` 
ADD COLUMN `selected_pois` JSON DEFAULT NULL COMMENT '选中的景点索引（JSON格式）' AFTER `pois_data`;

-- ============================================
-- 说明：
-- weather_data: 存储从PlanPage获取的天气信息
-- pois_data: 存储从PlanPage获取的景点列表
-- selected_pois: 存储用户选中的景点索引数组
-- ============================================
