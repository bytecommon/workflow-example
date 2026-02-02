-- ====================================
-- 流程模板管理数据库表结构
-- ====================================

-- 1. 流程模板表
CREATE TABLE `workflow_template` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `template_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '模板唯一标识',
    `template_name` VARCHAR(200) NOT NULL COMMENT '模板名称',
    `template_desc` VARCHAR(500) COMMENT '模板描述',
    `category` VARCHAR(50) COMMENT '分类',
    `version` INT DEFAULT 1 COMMENT '版本号',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    `icon` VARCHAR(200) COMMENT '图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_by` VARCHAR(64) COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` VARCHAR(64) COMMENT '更新人',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    UNIQUE KEY `uk_template_key_version` (`template_key`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程模板表';

-- 2. 流程模板节点表
CREATE TABLE `workflow_template_node` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `template_id` BIGINT NOT NULL COMMENT '模板ID',
    `node_key` VARCHAR(100) NOT NULL COMMENT '节点唯一标识',
    `node_name` VARCHAR(200) NOT NULL COMMENT '节点名称',
    `node_type` VARCHAR(50) NOT NULL COMMENT '节点类型：START-开始，APPROVE-审批，CC-抄送，CONDITION-条件，END-结束',
    `position_x` INT COMMENT 'X坐标',
    `position_y` INT COMMENT 'Y坐标',
    `config` TEXT COMMENT '节点配置JSON',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_template_id` (`template_id`),
    UNIQUE KEY `uk_template_node_key` (`template_id`, `node_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程模板节点表';

-- 3. 流程模板连线表
CREATE TABLE `workflow_template_edge` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `template_id` BIGINT NOT NULL COMMENT '模板ID',
    `source_node_id` BIGINT NOT NULL COMMENT '源节点ID',
    `target_node_id` BIGINT NOT NULL COMMENT '目标节点ID',
    `condition_expr` TEXT COMMENT '条件表达式',
    `priority` INT DEFAULT 0 COMMENT '优先级',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_template_id` (`template_id`),
    INDEX `idx_source_node` (`source_node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程模板连线表';

-- 4. 修改工作流定义表，添加模板关联字段
ALTER TABLE `workflow_definition`
ADD COLUMN `template_id` BIGINT COMMENT '关联模板ID' AFTER `category`,
ADD INDEX `idx_template_id` (`template_id`);

-- 插入示例模板数据
INSERT INTO `workflow_template` (`template_key`, `template_name`, `template_desc`, `category`, `icon`, `sort_order`) VALUES
('simple_approve', '简单审批流程', '适用于简单的单级审批流程', '通用', 'check-circle', 1),
('multi_approve', '多级审批流程', '适用于需要多级审批的流程', '通用', 'layers', 2),
('sequential_approve', '顺序审批流程', '适用于依次审批的流程', '通用', 'arrow-right', 3),
('parallel_approve', '并行审批流程', '适用于需要多人同时审批的流程', '通用', 'git-branch', 4),
('conditional_approve', '条件审批流程', '适用于根据条件走不同分支的流程', '通用', 'git-commit', 5);

-- 插入简单审批流程模板的节点
INSERT INTO `workflow_template_node` (`template_id`, `node_key`, `node_name`, `node_type`, `position_x`, `position_y`) VALUES
(1, 'start', '开始', 'START', 200, 100),
(1, 'approve', '审批', 'APPROVE', 400, 100),
(1, 'end', '结束', 'END', 600, 100);

-- 插入简单审批流程模板的连线
INSERT INTO `workflow_template_edge` (`template_id`, `source_node_id`, `target_node_id`) VALUES
(1, (SELECT id FROM workflow_template_node WHERE template_id=1 AND node_key='start'), (SELECT id FROM workflow_template_node WHERE template_id=1 AND node_key='approve')),
(1, (SELECT id FROM workflow_template_node WHERE template_id=1 AND node_key='approve'), (SELECT id FROM workflow_template_node WHERE template_id=1 AND node_key='end'));
