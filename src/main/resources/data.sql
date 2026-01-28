-- ====================================
-- 工作流系统测试数据
-- ====================================

-- 1. 插入测试表单
INSERT INTO workflow_form (id, form_key, form_name, form_desc, form_config, status, create_by) VALUES
(1, 'leave_form', '请假申请表', '员工请假申请表单', 
'{"fields":[{"name":"leaveType","label":"请假类型","type":"select","required":true,"options":["事假","病假","年假","调休"]},{"name":"days","label":"请假天数","type":"number","required":true},{"name":"startDate","label":"开始日期","type":"date","required":true},{"name":"endDate","label":"结束日期","type":"date","required":true},{"name":"reason","label":"请假原因","type":"textarea","required":true}]}', 
1, 'admin'),

(2, 'purchase_form', '采购申请表', '物品采购申请表单',
'{"fields":[{"name":"itemName","label":"物品名称","type":"text","required":true},{"name":"quantity","label":"数量","type":"number","required":true},{"name":"amount","label":"金额","type":"number","required":true},{"name":"supplier","label":"供应商","type":"text","required":false},{"name":"reason","label":"采购原因","type":"textarea","required":true}]}',
1, 'admin'),

(3, 'reimbursement_form', '报销申请表', '费用报销申请表单',
'{"fields":[{"name":"expenseType","label":"费用类型","type":"select","required":true,"options":["差旅费","招待费","办公费","其他"]},{"name":"amount","label":"报销金额","type":"number","required":true},{"name":"date","label":"费用日期","type":"date","required":true},{"name":"description","label":"费用说明","type":"textarea","required":true}]}',
1, 'admin');

-- 2. 插入测试工作流定义
INSERT INTO workflow_definition (id, workflow_key, workflow_name, workflow_desc, category, version, status, form_id, icon, create_by) VALUES
(1, 'leave_approval', '请假审批', '员工请假审批流程', '人事管理', 1, 1, 1, 'icon-leave', 'admin'),
(2, 'purchase_approval', '采购审批', '物品采购审批流程', '行政管理', 1, 1, 2, 'icon-purchase', 'admin'),
(3, 'reimbursement_approval', '报销审批', '费用报销审批流程', '财务管理', 1, 1, 3, 'icon-money', 'admin');

-- 3. 插入请假审批流程节点
INSERT INTO workflow_node (id, workflow_id, node_key, node_name, node_type, position_x, position_y) VALUES
(1, 1, 'start', '开始', 'START', 100, 200),
(2, 1, 'dept_manager', '部门主管审批', 'APPROVE', 300, 200),
(3, 1, 'hr_manager', '人事经理审批', 'APPROVE', 500, 200),
(4, 1, 'end', '结束', 'END', 700, 200);

-- 4. 插入采购审批流程节点
INSERT INTO workflow_node (id, workflow_id, node_key, node_name, node_type, position_x, position_y) VALUES
(5, 2, 'start', '开始', 'START', 100, 200),
(6, 2, 'dept_manager', '部门主管审批', 'APPROVE', 300, 200),
(7, 2, 'condition', '金额判断', 'CONDITION', 500, 200),
(8, 2, 'finance_manager', '财务经理审批', 'APPROVE', 650, 100),
(9, 2, 'general_manager', '总经理审批', 'APPROVE', 650, 300),
(10, 2, 'end', '结束', 'END', 850, 200);

-- 5. 插入报销审批流程节点
INSERT INTO workflow_node (id, workflow_id, node_key, node_name, node_type, position_x, position_y) VALUES
(11, 3, 'start', '开始', 'START', 100, 200),
(12, 3, 'dept_manager', '部门主管审批', 'APPROVE', 300, 200),
(13, 3, 'finance', '财务审批', 'APPROVE', 500, 200),
(14, 3, 'end', '结束', 'END', 700, 200);

-- 6. 插入请假审批流程连线
INSERT INTO workflow_edge (id, workflow_id, source_node_id, target_node_id, priority) VALUES
(1, 1, 1, 2, 0),
(2, 1, 2, 3, 0),
(3, 1, 3, 4, 0);

-- 7. 插入采购审批流程连线
INSERT INTO workflow_edge (id, workflow_id, source_node_id, target_node_id, priority) VALUES
(4, 2, 5, 6, 0),
(5, 2, 6, 7, 0),
(6, 2, 7, 8, 0),  -- 金额<10000，走财务经理
(7, 2, 7, 9, 1),  -- 金额>=10000，走总经理
(8, 2, 8, 10, 0),
(9, 2, 9, 10, 0);

-- 8. 插入报销审批流程连线
INSERT INTO workflow_edge (id, workflow_id, source_node_id, target_node_id, priority) VALUES
(10, 3, 11, 12, 0),
(11, 3, 12, 13, 0),
(12, 3, 13, 14, 0);

-- 9. 插入审批人配置（请假审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(2, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(3, 'USER', 'hr001:李总监', 'OR', 'AUTO_PASS');

-- 10. 插入审批人配置（采购审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(6, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(8, 'USER', 'finance001:王财务', 'OR', 'AUTO_PASS'),
(9, 'USER', 'ceo001:赵总', 'OR', 'AUTO_PASS');

-- 11. 插入审批人配置（报销审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(12, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(13, 'USER', 'finance001:王财务', 'OR', 'AUTO_PASS');

-- 12. 插入测试流程实例（已完成的请假流程）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, start_user_id, start_user_name, start_time, end_time, duration, title, priority) VALUES
(1, 'WF202401010001', 1, 'leave_approval', '请假审批', 1, 
'{"leaveType":"事假","days":3,"startDate":"2024-01-15","endDate":"2024-01-17","reason":"家里有事"}', 
'APPROVED', 'user001', '张三', '2024-01-10 09:00:00', '2024-01-10 15:30:00', 23400000, '张三的请假申请-3天事假', 0);

-- 13. 插入测试任务（已完成）
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, complete_time, priority) VALUES
(1, 'WF202401010001', 2, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'APPROVED', '同意', '2024-01-10 09:00:00', '2024-01-10 10:30:00', 0),
(1, 'WF202401010001', 3, 'hr_manager', '人事经理审批', 'APPROVE', 'hr001', '李总监', 'APPROVED', '同意', '2024-01-10 10:30:00', '2024-01-10 15:30:00', 0);

-- 14. 插入测试历史记录
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(1, NULL, 1, '开始', 'START', 'user001', '张三', '发起请假申请', '2024-01-10 09:00:00', 0),
(1, 1, 2, '部门主管审批', 'APPROVE', 'manager001', '张经理', '同意', '2024-01-10 10:30:00', 5400000),
(1, 2, 3, '人事经理审批', 'APPROVE', 'hr001', '李总监', '同意', '2024-01-10 15:30:00', 18000000);

-- 15. 插入正在运行的流程实例
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, title, priority) VALUES
(2, 'WF202401150001', 2, 'purchase_approval', '采购审批', 2,
'{"itemName":"办公桌椅","quantity":10,"amount":5000,"supplier":"家具公司","reason":"办公室扩建"}',
'RUNNING', 6, 'user002', '李四', '2024-01-15 10:00:00', '李四的采购申请-办公桌椅', 0);

-- 16. 插入待办任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, create_time, priority) VALUES
(2, 'WF202401150001', 6, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'PENDING', '2024-01-15 10:00:00', 0);

-- 17. 插入运行中流程的历史
INSERT INTO workflow_history (instance_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time) VALUES
(2, 5, '开始', 'START', 'user002', '李四', '发起采购申请', '2024-01-15 10:00:00');

-- 提交事务
COMMIT;
