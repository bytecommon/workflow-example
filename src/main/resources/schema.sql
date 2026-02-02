-- ====================================
-- 工作流系统数据库表结构 (H2数据库)
-- ====================================

-- 1. 工作流定义表
CREATE TABLE IF NOT EXISTS workflow_definition (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    workflow_key VARCHAR(100) NOT NULL COMMENT '工作流唯一标识',
    workflow_name VARCHAR(200) NOT NULL COMMENT '工作流名称',
    workflow_desc VARCHAR(500) COMMENT '工作流描述',
    category VARCHAR(50) COMMENT '分类',
    version INT DEFAULT 1 COMMENT '版本号',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    form_id BIGINT COMMENT '关联表单ID',
    icon VARCHAR(200) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_by VARCHAR(64) COMMENT '创建人',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) COMMENT '更新人',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_workflow_key_version ON workflow_definition(workflow_key, version);

-- 2. 工作流节点定义表
CREATE TABLE IF NOT EXISTS workflow_node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    workflow_id BIGINT NOT NULL COMMENT '工作流定义ID',
    node_key VARCHAR(100) NOT NULL COMMENT '节点唯一标识',
    node_name VARCHAR(200) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型：START-开始，APPROVE-审批，CC-抄送，CONDITION-条件，END-结束',
    position_x INT COMMENT 'X坐标',
    position_y INT COMMENT 'Y坐标',
    config TEXT COMMENT '节点配置JSON',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

CREATE INDEX IF NOT EXISTS idx_workflow_id ON workflow_node(workflow_id);

-- 3. 工作流连线定义表
CREATE TABLE IF NOT EXISTS workflow_edge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    workflow_id BIGINT NOT NULL COMMENT '工作流定义ID',
    source_node_id BIGINT NOT NULL COMMENT '源节点ID',
    target_node_id BIGINT NOT NULL COMMENT '目标节点ID',
    condition_expr TEXT COMMENT '条件表达式',
    priority INT DEFAULT 0 COMMENT '优先级',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

CREATE INDEX IF NOT EXISTS idx_workflow_edge_id ON workflow_edge(workflow_id);
CREATE INDEX IF NOT EXISTS idx_source_node ON workflow_edge(source_node_id);

-- 4. 审批人配置表
CREATE TABLE IF NOT EXISTS workflow_approver (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    node_id BIGINT NOT NULL COMMENT '节点ID',
    approver_type VARCHAR(50) NOT NULL COMMENT '审批人类型：USER-指定用户，ROLE-角色，DEPT-部门，LEADER-上级领导，SELF-发起人自己，FORM_USER-表单字段',
    approver_value VARCHAR(500) COMMENT '审批人值',
    approve_mode VARCHAR(20) COMMENT '审批模式：AND-会签，OR-或签，SEQUENCE-依次审批',
    nobody_handler VARCHAR(20) COMMENT '无审批人处理：AUTO_PASS-自动通过，ADMIN-转交管理员',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

CREATE INDEX IF NOT EXISTS idx_node_id ON workflow_approver(node_id);

-- 5. 自定义表单表
CREATE TABLE IF NOT EXISTS workflow_form (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    form_key VARCHAR(100) NOT NULL UNIQUE COMMENT '表单唯一标识',
    form_name VARCHAR(200) NOT NULL COMMENT '表单名称',
    form_desc VARCHAR(500) COMMENT '表单描述',
    form_config TEXT COMMENT '表单配置JSON',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    create_by VARCHAR(64) COMMENT '创建人',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) COMMENT '更新人',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
);

-- 6. 工作流实例表
CREATE TABLE IF NOT EXISTS workflow_instance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    instance_no VARCHAR(100) NOT NULL UNIQUE COMMENT '流程实例编号',
    workflow_id BIGINT NOT NULL COMMENT '工作流定义ID',
    workflow_key VARCHAR(100) NOT NULL COMMENT '工作流标识',
    workflow_name VARCHAR(200) NOT NULL COMMENT '工作流名称',
    form_id BIGINT COMMENT '表单ID',
    form_data TEXT COMMENT '表单数据JSON',
    status VARCHAR(20) NOT NULL COMMENT '状态：RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止',
    current_node_id BIGINT COMMENT '当前节点ID',
    start_user_id VARCHAR(64) NOT NULL COMMENT '发起人ID',
    start_user_name VARCHAR(100) COMMENT '发起人姓名',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发起时间',
    end_time TIMESTAMP COMMENT '结束时间',
    duration BIGINT COMMENT '耗时（毫秒）',
    business_key VARCHAR(200) COMMENT '业务键',
    title VARCHAR(500) COMMENT '流程标题',
    priority TINYINT DEFAULT 0 COMMENT '优先级：0-普通，1-紧急，2-特急',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
);

CREATE INDEX IF NOT EXISTS idx_workflow_inst_id ON workflow_instance(workflow_id);
CREATE INDEX IF NOT EXISTS idx_start_user ON workflow_instance(start_user_id);
CREATE INDEX IF NOT EXISTS idx_status ON workflow_instance(status);
CREATE INDEX IF NOT EXISTS idx_create_time ON workflow_instance(start_time);

-- 7. 工作流任务表
CREATE TABLE IF NOT EXISTS workflow_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    instance_id BIGINT NOT NULL COMMENT '流程实例ID',
    instance_no VARCHAR(100) NOT NULL COMMENT '流程实例编号',
    node_id BIGINT NOT NULL COMMENT '节点ID',
    node_key VARCHAR(100) NOT NULL COMMENT '节点标识',
    node_name VARCHAR(200) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型',
    assignee_id VARCHAR(64) COMMENT '审批人ID',
    assignee_name VARCHAR(100) COMMENT '审批人姓名',
    status VARCHAR(20) NOT NULL COMMENT '状态：PENDING-待处理，APPROVED-已同意，REJECTED-已拒绝，TRANSFERRED-已转交，CANCELED-已取消',
    comment TEXT COMMENT '审批意见',
    attachments TEXT COMMENT '附件JSON',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    claim_time TIMESTAMP COMMENT '签收时间',
    complete_time TIMESTAMP COMMENT '完成时间',
    due_time TIMESTAMP COMMENT '截止时间',
    priority TINYINT DEFAULT 0 COMMENT '优先级'
);

CREATE INDEX IF NOT EXISTS idx_instance_id ON workflow_task(instance_id);
CREATE INDEX IF NOT EXISTS idx_assignee_status ON workflow_task(assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_task_status ON workflow_task(status);

-- 8. 工作流历史表
CREATE TABLE IF NOT EXISTS workflow_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    instance_id BIGINT NOT NULL COMMENT '流程实例ID',
    task_id BIGINT COMMENT '任务ID',
    node_id BIGINT NOT NULL COMMENT '节点ID',
    node_name VARCHAR(200) NOT NULL COMMENT '节点名称',
    action VARCHAR(50) NOT NULL COMMENT '操作：START-发起，APPROVE-同意，REJECT-拒绝，TRANSFER-转交，CANCEL-撤销',
    operator_id VARCHAR(64) NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(100) NOT NULL COMMENT '操作人姓名',
    comment TEXT COMMENT '意见',
    attachments TEXT COMMENT '附件',
    duration BIGINT COMMENT '处理耗时（毫秒）',
    operate_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间'
);

CREATE INDEX IF NOT EXISTS idx_hist_instance_id ON workflow_history(instance_id);
CREATE INDEX IF NOT EXISTS idx_task_id ON workflow_history(task_id);

-- 9. 工作流抄送表
CREATE TABLE IF NOT EXISTS workflow_cc (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    instance_id BIGINT NOT NULL COMMENT '流程实例ID',
    instance_no VARCHAR(100) NOT NULL COMMENT '流程实例编号',
    node_id BIGINT NOT NULL COMMENT '节点ID',
    node_name VARCHAR(200) NOT NULL COMMENT '节点名称',
    cc_user_id VARCHAR(64) NOT NULL COMMENT '抄送人ID',
    cc_user_name VARCHAR(100) NOT NULL COMMENT '抄送人姓名',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未读，1-已读',
    read_time TIMESTAMP COMMENT '阅读时间',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

CREATE INDEX IF NOT EXISTS idx_cc_instance_id ON workflow_cc(instance_id);
CREATE INDEX IF NOT EXISTS idx_cc_user ON workflow_cc(cc_user_id, status);

-- 10. 工作流变量表
CREATE TABLE IF NOT EXISTS workflow_variable (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    instance_id BIGINT NOT NULL COMMENT '流程实例ID',
    var_key VARCHAR(100) NOT NULL COMMENT '变量键',
    var_value TEXT COMMENT '变量值',
    var_type VARCHAR(50) COMMENT '变量类型',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_instance_key ON workflow_variable(instance_id, var_key);

-- ====================================
-- 流程模板管理数据库表结构
-- ====================================

-- 1. 流程模板表
CREATE TABLE IF NOT EXISTS workflow_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_key VARCHAR(100) NOT NULL UNIQUE COMMENT '模板唯一标识',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    template_desc VARCHAR(500) COMMENT '模板描述',
    category VARCHAR(50) COMMENT '分类',
    version INT DEFAULT 1 COMMENT '版本号',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    icon VARCHAR(200) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_by VARCHAR(64) COMMENT '创建人',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(64) COMMENT '更新人',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除'
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_template_key_version ON workflow_template(template_key, version);

-- 2. 流程模板节点表
CREATE TABLE IF NOT EXISTS workflow_template_node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    node_key VARCHAR(100) NOT NULL COMMENT '节点唯一标识',
    node_name VARCHAR(200) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型：START-开始，APPROVE-审批，CC-抄送，CONDITION-条件，END-结束',
    position_x INT COMMENT 'X坐标',
    position_y INT COMMENT 'Y坐标',
    config TEXT COMMENT '节点配置JSON',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

CREATE INDEX IF NOT EXISTS idx_template_id ON workflow_template_node(template_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_template_node_key ON workflow_template_node(template_id, node_key);

-- 3. 流程模板连线表
CREATE TABLE IF NOT EXISTS workflow_template_edge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    source_node_id BIGINT NOT NULL COMMENT '源节点ID',
    target_node_id BIGINT NOT NULL COMMENT '目标节点ID',
    condition_expr TEXT COMMENT '条件表达式',
    priority INT DEFAULT 0 COMMENT '优先级',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

CREATE INDEX IF NOT EXISTS idx_template_edge_id ON workflow_template_edge(template_id);
CREATE INDEX IF NOT EXISTS idx_template_source_node ON workflow_template_edge(source_node_id);

-- 4. 修改工作流定义表，添加模板关联字段
ALTER TABLE workflow_definition ADD COLUMN IF NOT EXISTS template_id BIGINT COMMENT '关联模板ID';
CREATE INDEX IF NOT EXISTS idx_template_id ON workflow_definition(template_id);
