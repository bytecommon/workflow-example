-- ====================================
-- 工作流系统数据库表结构设计
-- ====================================

-- 1. 工作流定义表
CREATE TABLE `workflow_definition` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `workflow_key` VARCHAR(100) NOT NULL COMMENT '工作流唯一标识',
    `workflow_name` VARCHAR(200) NOT NULL COMMENT '工作流名称',
    `workflow_desc` VARCHAR(500) COMMENT '工作流描述',
    `category` VARCHAR(50) COMMENT '分类',
    `version` INT DEFAULT 1 COMMENT '版本号',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    `form_id` BIGINT COMMENT '关联表单ID',
    `icon` VARCHAR(200) COMMENT '图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_by` VARCHAR(64) COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` VARCHAR(64) COMMENT '更新人',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
    UNIQUE KEY `uk_workflow_key_version` (`workflow_key`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流定义表';

-- 2. 工作流节点定义表
CREATE TABLE `workflow_node` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `workflow_id` BIGINT NOT NULL COMMENT '工作流定义ID',
    `node_key` VARCHAR(100) NOT NULL COMMENT '节点唯一标识',
    `node_name` VARCHAR(200) NOT NULL COMMENT '节点名称',
    `node_type` VARCHAR(50) NOT NULL COMMENT '节点类型：START-开始，APPROVE-审批，CC-抄送，CONDITION-条件，END-结束',
    `position_x` INT COMMENT 'X坐标',
    `position_y` INT COMMENT 'Y坐标',
    `config` TEXT COMMENT '节点配置JSON',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_workflow_id` (`workflow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流节点定义表';

-- 3. 工作流连线定义表
CREATE TABLE `workflow_edge` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `workflow_id` BIGINT NOT NULL COMMENT '工作流定义ID',
    `source_node_id` BIGINT NOT NULL COMMENT '源节点ID',
    `target_node_id` BIGINT NOT NULL COMMENT '目标节点ID',
    `condition_expr` TEXT COMMENT '条件表达式',
    `priority` INT DEFAULT 0 COMMENT '优先级',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_workflow_id` (`workflow_id`),
    INDEX `idx_source_node` (`source_node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流连线定义表';

-- 4. 审批人配置表
CREATE TABLE `workflow_approver` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `node_id` BIGINT NOT NULL COMMENT '节点ID',
    `approver_type` VARCHAR(50) NOT NULL COMMENT '审批人类型：USER-指定用户，ROLE-角色，DEPT-部门，LEADER-上级领导，SELF-发起人自己，FORM_USER-表单字段',
    `approver_value` VARCHAR(500) COMMENT '审批人值',
    `approve_mode` VARCHAR(20) COMMENT '审批模式：AND-会签，OR-或签，SEQUENCE-依次审批',
    `nobody_handler` VARCHAR(20) COMMENT '无审批人处理：AUTO_PASS-自动通过，ADMIN-转交管理员',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_node_id` (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批人配置表';

-- 5. 自定义表单表
CREATE TABLE `workflow_form` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `form_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '表单唯一标识',
    `form_name` VARCHAR(200) NOT NULL COMMENT '表单名称',
    `form_desc` VARCHAR(500) COMMENT '表单描述',
    `form_config` LONGTEXT COMMENT '表单配置JSON',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    `create_by` VARCHAR(64) COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` VARCHAR(64) COMMENT '更新人',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='自定义表单表';

-- 6. 工作流实例表
CREATE TABLE `workflow_instance` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `instance_no` VARCHAR(100) NOT NULL UNIQUE COMMENT '流程实例编号',
    `workflow_id` BIGINT NOT NULL COMMENT '工作流定义ID',
    `workflow_key` VARCHAR(100) NOT NULL COMMENT '工作流标识',
    `workflow_name` VARCHAR(200) NOT NULL COMMENT '工作流名称',
    `form_id` BIGINT COMMENT '表单ID',
    `form_data` LONGTEXT COMMENT '表单数据JSON',
    `status` VARCHAR(20) NOT NULL COMMENT '状态：RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止',
    `current_node_id` BIGINT COMMENT '当前节点ID',
    `start_user_id` VARCHAR(64) NOT NULL COMMENT '发起人ID',
    `start_user_name` VARCHAR(100) COMMENT '发起人姓名',
    `start_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发起时间',
    `end_time` DATETIME COMMENT '结束时间',
    `duration` BIGINT COMMENT '耗时（毫秒）',
    `business_key` VARCHAR(200) COMMENT '业务键',
    `title` VARCHAR(500) COMMENT '流程标题',
    `priority` TINYINT DEFAULT 0 COMMENT '优先级：0-普通，1-紧急，2-特急',
    `deleted` TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX `idx_workflow_id` (`workflow_id`),
    INDEX `idx_start_user` (`start_user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_create_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流实例表';

-- 7. 工作流任务表
CREATE TABLE `workflow_task` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
    `instance_no` VARCHAR(100) NOT NULL COMMENT '流程实例编号',
    `node_id` BIGINT NOT NULL COMMENT '节点ID',
    `node_key` VARCHAR(100) NOT NULL COMMENT '节点标识',
    `node_name` VARCHAR(200) NOT NULL COMMENT '节点名称',
    `node_type` VARCHAR(50) NOT NULL COMMENT '节点类型',
    `assignee_id` VARCHAR(64) COMMENT '审批人ID',
    `assignee_name` VARCHAR(100) COMMENT '审批人姓名',
    `status` VARCHAR(20) NOT NULL COMMENT '状态：PENDING-待处理，APPROVED-已同意，REJECTED-已拒绝，TRANSFERRED-已转交，CANCELED-已取消',
    `comment` TEXT COMMENT '审批意见',
    `attachments` TEXT COMMENT '附件JSON',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `claim_time` DATETIME COMMENT '签收时间',
    `complete_time` DATETIME COMMENT '完成时间',
    `due_time` DATETIME COMMENT '截止时间',
    `priority` TINYINT DEFAULT 0 COMMENT '优先级',
    INDEX `idx_instance_id` (`instance_id`),
    INDEX `idx_assignee` (`assignee_id`, `status`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流任务表';

-- 8. 工作流历史表
CREATE TABLE `workflow_history` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
    `task_id` BIGINT COMMENT '任务ID',
    `node_id` BIGINT NOT NULL COMMENT '节点ID',
    `node_name` VARCHAR(200) NOT NULL COMMENT '节点名称',
    `action` VARCHAR(50) NOT NULL COMMENT '操作：START-发起，APPROVE-同意，REJECT-拒绝，TRANSFER-转交，CANCEL-撤销',
    `operator_id` VARCHAR(64) NOT NULL COMMENT '操作人ID',
    `operator_name` VARCHAR(100) NOT NULL COMMENT '操作人姓名',
    `comment` TEXT COMMENT '意见',
    `attachments` TEXT COMMENT '附件',
    `duration` BIGINT COMMENT '处理耗时（毫秒）',
    `operate_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX `idx_instance_id` (`instance_id`),
    INDEX `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流历史表';

-- 9. 工作流抄送表
CREATE TABLE `workflow_cc` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
    `instance_no` VARCHAR(100) NOT NULL COMMENT '流程实例编号',
    `node_id` BIGINT NOT NULL COMMENT '节点ID',
    `node_name` VARCHAR(200) NOT NULL COMMENT '节点名称',
    `cc_user_id` VARCHAR(64) NOT NULL COMMENT '抄送人ID',
    `cc_user_name` VARCHAR(100) NOT NULL COMMENT '抄送人姓名',
    `status` TINYINT DEFAULT 0 COMMENT '状态：0-未读，1-已读',
    `read_time` DATETIME COMMENT '阅读时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_instance_id` (`instance_id`),
    INDEX `idx_cc_user` (`cc_user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流抄送表';

-- 10. 工作流变量表（用于存储流程变量）
CREATE TABLE `workflow_variable` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
    `var_key` VARCHAR(100) NOT NULL COMMENT '变量键',
    `var_value` TEXT COMMENT '变量值',
    `var_type` VARCHAR(50) COMMENT '变量类型',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_instance_key` (`instance_id`, `var_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流变量表';
