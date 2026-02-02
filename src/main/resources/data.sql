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
1, 'admin'),

(4, 'business_trip_form', '出差申请表', '员工出差申请表单',
'{"fields":[{"name":"tripType","label":"出差类型","type":"select","required":true,"options":["国内出差","国外出差"]},{"name":"destination","label":"出差地点","type":"text","required":true},{"name":"startDate","label":"开始日期","type":"date","required":true},{"name":"endDate","label":"结束日期","type":"date","required":true},{"name":"days","label":"出差天数","type":"number","required":true},{"name":"budget","label":"预算金额","type":"number","required":true},{"name":"reason","label":"出差原因","type":"textarea","required":true}]}',
1, 'admin'),

(5, 'seal_form', '用印申请表', '公司印章使用申请表单',
'{"fields":[{"name":"sealType","label":"印章类型","type":"select","required":true,"options":["公章","合同章","财务章","法人章"]},{"name":"docName","label":"文件名称","type":"text","required":true},{"name":"docCount","label":"文件份数","type":"number","required":true},{"name":"usage","label":"用印事由","type":"textarea","required":true}]}',
1, 'admin');

-- 2. 插入测试工作流定义
INSERT INTO workflow_definition (id, workflow_key, workflow_name, workflow_desc, category, version, status, form_id, icon, create_by) VALUES
(1, 'leave_approval', '请假审批', '员工请假审批流程', '人事管理', 1, 1, 1, 'icon-leave', 'admin'),
(2, 'purchase_approval', '采购审批', '物品采购审批流程', '行政管理', 1, 1, 2, 'icon-purchase', 'admin'),
(3, 'reimbursement_approval', '报销审批', '费用报销审批流程', '财务管理', 1, 1, 3, 'icon-money', 'admin'),
(4, 'business_trip_approval', '出差审批', '员工出差审批流程', '行政管理', 1, 1, 4, 'icon-trip', 'admin'),
(5, 'seal_approval', '用印审批', '印章使用审批流程', '行政管理', 1, 1, 5, 'icon-seal', 'admin');

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

-- 6. 插入出差审批流程节点（带条件分支）
INSERT INTO workflow_node (id, workflow_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(15, 4, 'start', '开始', 'START', 100, 200, NULL),
(16, 4, 'dept_manager', '部门主管审批', 'APPROVE', 300, 200, NULL),
(17, 4, 'condition_trip', '出差条件判断', 'CONDITION', 500, 200, '{"conditionType":"duration","conditionField":"days"}'),
(18, 4, 'general_manager', '总经理审批', 'APPROVE', 650, 100, NULL),
(19, 4, 'hr_cc', '人事抄送', 'CC', 650, 300, NULL),
(20, 4, 'end', '结束', 'END', 850, 200, NULL);

-- 7. 插入用印审批流程节点（带会签）
INSERT INTO workflow_node (id, workflow_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(21, 5, 'start', '开始', 'START', 100, 200, NULL),
(22, 5, 'dept_manager', '部门主管审批', 'APPROVE', 300, 200, NULL),
(23, 5, 'admin_cc', '行政审批', 'APPROVE', 500, 200, NULL),
(24, 5, 'general_manager', '总经理审批', 'APPROVE', 700, 200, NULL),
(25, 5, 'end', '结束', 'END', 900, 200, NULL);

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

-- 9. 插入出差审批流程连线
INSERT INTO workflow_edge (id, workflow_id, source_node_id, target_node_id, condition_expr, priority) VALUES
(13, 4, 15, 16, NULL, 0),
(14, 4, 16, 17, NULL, 0),
(15, 4, 17, 18, '${days >= 7}', 1),  -- 出差7天及以上，需要总经理审批
(16, 4, 17, 19, '${days < 7}', 2),   -- 出差7天以下，仅人事抄送
(17, 4, 18, 20, NULL, 0),
(18, 4, 19, 20, NULL, 0);

-- 10. 插入用印审批流程连线
INSERT INTO workflow_edge (id, workflow_id, source_node_id, target_node_id, priority) VALUES
(19, 5, 21, 22, 0),
(20, 5, 22, 23, 0),
(21, 5, 23, 24, 0),
(22, 5, 24, 25, 0);

-- 11. 插入审批人配置（请假审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(2, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(3, 'USER', 'hr001:李总监', 'OR', 'AUTO_PASS');

-- 12. 插入审批人配置（采购审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(6, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(8, 'USER', 'finance001:王财务', 'OR', 'AUTO_PASS'),
(9, 'USER', 'ceo001:赵总', 'OR', 'AUTO_PASS');

-- 13. 插入审批人配置（报销审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(12, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(13, 'USER', 'finance001:王财务', 'OR', 'AUTO_PASS');

-- 14. 插入审批人配置（出差审批）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(16, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(18, 'USER', 'ceo001:赵总', 'OR', 'AUTO_PASS'),
(19, 'USER', 'hr001:李总监,hr002:王人事', 'OR', 'AUTO_PASS');  -- 抄送多人

-- 15. 插入审批人配置（用印审批 - 会签）
INSERT INTO workflow_approver (node_id, approver_type, approver_value, approve_mode, nobody_handler) VALUES
(22, 'USER', 'manager001:张经理', 'OR', 'AUTO_PASS'),
(23, 'ROLE', 'role_admin:行政部', 'AND', 'AUTO_PASS'),  -- 会签：行政部多人审批
(24, 'USER', 'ceo001:赵总', 'OR', 'AUTO_PASS');

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

-- 16. 插入正在运行的流程实例（采购审批）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, title, priority) VALUES
(2, 'WF202401150001', 2, 'purchase_approval', '采购审批', 2,
'{"itemName":"办公桌椅","quantity":10,"amount":5000,"supplier":"家具公司","reason":"办公室扩建"}',
'RUNNING', 6, 'user002', '李四', '2024-01-15 10:00:00', '李四的采购申请-办公桌椅', 0);

-- 17. 插入待办任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, create_time, priority) VALUES
(2, 'WF202401150001', 6, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'PENDING', '2024-01-15 10:00:00', 0);

-- 18. 插入运行中流程的历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(2, NULL, 5, '开始', 'START', 'user002', '李四', '发起采购申请', '2024-01-15 10:00:00', 0);

-- 19. 插入已拒绝的流程实例（请假审批被拒绝）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, end_time, duration, title, priority) VALUES
(3, 'WF202401200001', 1, 'leave_approval', '请假审批', 1,
'{"leaveType":"事假","days":10,"startDate":"2024-01-25","endDate":"2024-02-03","reason":"想多休息几天"}',
'REJECTED', 2, 'user003', '王五', '2024-01-20 14:00:00', '2024-01-20 16:00:00', 7200000, '王五的请假申请-10天事假', 0);

-- 20. 插入已拒绝的任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, complete_time, priority) VALUES
(3, 'WF202401200001', 2, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'REJECTED', '请假时间太长，建议缩短', '2024-01-20 14:00:00', '2024-01-20 16:00:00', 0);

-- 21. 插入已拒绝流程的历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(3, NULL, 1, '开始', 'START', 'user003', '王五', '发起请假申请', '2024-01-20 14:00:00', 0),
(3, 1, 2, '部门主管审批', 'REJECT', 'manager001', '张经理', '请假时间太长，建议缩短', '2024-01-20 16:00:00', 7200000);

-- 22. 插入已取消的流程实例（报销审批已撤销）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, end_time, duration, title, priority) VALUES
(4, 'WF202401220001', 3, 'reimbursement_approval', '报销审批', 3,
'{"expenseType":"差旅费","amount":2000,"date":"2024-01-15","description":"上海出差住宿费"}',
'CANCELED', 12, 'user004', '赵六', '2024-01-22 09:00:00', '2024-01-22 09:30:00', 1800000, '赵六的报销申请-差旅费', 0);

-- 23. 插入已取消流程的历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(4, NULL, 11, '开始', 'START', 'user004', '赵六', '发起报销申请', '2024-01-22 09:00:00', 0),
(4, NULL, 12, '部门主管审批', 'CANCEL', 'user004', '赵六', '主动撤销申请', '2024-01-22 09:30:00', 1800000);

-- 24. 插入出差审批流程实例（带条件分支）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, title, priority) VALUES
(5, 'WF202401250001', 4, 'business_trip_approval', '出差审批', 4,
'{"tripType":"国内出差","destination":"北京","startDate":"2024-02-01","endDate":"2024-02-10","days":10,"budget":8000,"reason":"参加行业会议"}',
'RUNNING', 18, 'user005', '孙七', '2024-01-25 11:00:00', '孙七的出差申请-10天北京', 0);

-- 25. 插入出差审批待办任务（10天，需总经理审批）
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, create_time, priority) VALUES
(5, 'WF202401250001', 18, 'general_manager', '总经理审批', 'APPROVE', 'ceo001', '赵总', 'PENDING', '2024-01-25 11:00:00', 0);

-- 26. 插入出差审批流程历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(5, NULL, 15, '开始', 'START', 'user005', '孙七', '发起出差申请', '2024-01-25 11:00:00', 0),
(5, NULL, 16, '部门主管审批', 'APPROVE', 'manager001', '张经理', '同意', '2024-01-25 11:30:00', 1800000);

-- 27. 插入另一个出差审批流程实例（短途出差）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, end_time, duration, title, priority) VALUES
(6, 'WF202401260001', 4, 'business_trip_approval', '出差审批', 4,
'{"tripType":"国内出差","destination":"上海","startDate":"2024-01-28","endDate":"2024-01-30","days":3,"budget":1500,"reason":"客户拜访"}',
'APPROVED', 20, 'user006', '周八', '2024-01-26 14:00:00', '2024-01-26 15:00:00', 3600000, '周八的出差申请-3天上海', 0);

-- 28. 插入短途出差审批任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, complete_time, priority) VALUES
(6, 'WF202401260001', 16, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'APPROVED', '同意', '2024-01-26 14:00:00', '2024-01-26 14:30:00', 0),
(6, 'WF202401260001', 19, 'hr_cc', '人事抄送', 'CC', 'hr001', '李总监', 'APPROVED', '已知晓', '2024-01-26 14:30:00', '2024-01-26 15:00:00', 0);

-- 29. 插入短途出差流程历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(6, NULL, 15, '开始', 'START', 'user006', '周八', '发起出差申请', '2024-01-26 14:00:00', 0),
(6, 1, 16, '部门主管审批', 'APPROVE', 'manager001', '张经理', '同意', '2024-01-26 14:30:00', 1800000),
(6, 2, 19, '人事抄送', 'APPROVE', 'hr001', '李总监', '已知晓', '2024-01-26 15:00:00', 1800000);

-- 30. 插入抄送记录
INSERT INTO workflow_cc (instance_id, instance_no, node_id, node_name, cc_user_id, cc_user_name, status, create_time, read_time) VALUES
(5, 'WF202401250001', 19, '人事抄送', 'hr001', '李总监', 0, '2024-01-25 11:30:00', NULL),
(5, 'WF202401250001', 19, '人事抄送', 'hr002', '王人事', 0, '2024-01-25 11:30:00', NULL),
(6, 'WF202401260001', 19, '人事抄送', 'hr001', '李总监', 1, '2024-01-26 14:30:00', '2024-01-26 14:35:00'),
(6, 'WF202401260001', 19, '人事抄送', 'hr002', '王人事', 0, '2024-01-26 14:30:00', NULL);

-- 31. 插入流程变量数据
INSERT INTO workflow_variable (instance_id, var_key, var_value, var_type) VALUES
(2, 'amount', '5000', 'NUMBER'),
(2, 'itemName', '办公桌椅', 'STRING'),
(5, 'days', '10', 'NUMBER'),
(5, 'tripType', '国内出差', 'STRING'),
(5, 'destination', '北京', 'STRING'),
(6, 'days', '3', 'NUMBER'),
(6, 'tripType', '国内出差', 'STRING');

-- 32. 插入多任务审批示例（会签场景）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, title, priority) VALUES
(7, 'WF202401270001', 5, 'seal_approval', '用印审批', 5,
'{"sealType":"公章","docName":"采购合同","docCount":2,"usage":"与供应商签订采购合同"}',
'RUNNING', 23, 'user007', '吴九', '2024-01-27 09:00:00', '吴九的用印申请-采购合同', 0);

-- 33. 插入会签任务（行政部多人审批）
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, complete_time, priority) VALUES
(7, 'WF202401270001', 22, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'APPROVED', '同意', '2024-01-27 09:00:00', '2024-01-27 09:30:00', 0),
(7, 'WF202401270001', 23, 'admin_cc', '行政审批', 'APPROVE', 'admin001', '行政主管', 'PENDING', NULL, '2024-01-27 09:30:00', NULL, 0),
(7, 'WF202401270001', 23, 'admin_cc', '行政审批', 'APPROVE', 'admin002', '行政专员', 'PENDING', NULL, '2024-01-27 09:30:00', NULL, 0);

-- 34. 插入会签流程历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(7, NULL, 21, '开始', 'START', 'user007', '吴九', '发起用印申请', '2024-01-27 09:00:00', 0),
(7, 1, 22, '部门主管审批', 'APPROVE', 'manager001', '张经理', '同意', '2024-01-27 09:30:00', 1800000);

-- 35. 插入更多测试用户和任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, complete_time, priority) VALUES
(2, 'WF202401150001', 8, 'finance_manager', '财务经理审批', 'APPROVE', 'finance001', '王财务', 'PENDING', NULL, '2024-01-15 10:00:00', NULL, 0),
(3, 'WF202401200001', 3, 'hr_manager', '人事经理审批', 'APPROVE', 'hr001', '李总监', 'PENDING', NULL, '2024-01-20 14:00:00', NULL, 0);

-- 36. 插入已转交的任务示例
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, title, priority) VALUES
(8, 'WF202401280001', 3, 'reimbursement_approval', '报销审批', 3,
'{"expenseType":"招待费","amount":3000,"date":"2024-01-20","description":"客户招待"}',
'RUNNING', 13, 'user008', '郑十', '2024-01-28 10:00:00', '郑十的报销申请-招待费', 0);

-- 37. 插入已转交的任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, priority) VALUES
(8, 'WF202401280001', 12, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'TRANSFERRED', '转交财务直接审批', '2024-01-28 10:00:00', 0),
(8, 'WF202401280001', 13, 'finance', '财务审批', 'APPROVE', 'finance001', '王财务', 'PENDING', NULL, '2024-01-28 10:30:00', 0);

-- 38. 插入转交流程历史
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(8, NULL, 11, '开始', 'START', 'user008', '郑十', '发起报销申请', '2024-01-28 10:00:00', 0),
(8, 1, 12, '部门主管审批', 'TRANSFER', 'manager001', '张经理', '转交财务直接审批', '2024-01-28 10:30:00', 1800000);

-- 39. 插入已完成的复杂流程（包含多个审批节点）
INSERT INTO workflow_instance (id, instance_no, workflow_id, workflow_key, workflow_name, form_id, form_data, status, current_node_id, start_user_id, start_user_name, start_time, end_time, duration, title, priority) VALUES
(9, 'WF202401010002', 2, 'purchase_approval', '采购审批', 2,
'{"itemName":"电脑设备","quantity":20,"amount":120000,"supplier":"科技公司","reason":"全员电脑升级"}',
'APPROVED', 10, 'user001', '张三', '2024-01-10 08:00:00', '2024-01-11 17:00:00', 117600000, '张三的采购申请-电脑设备', 1);

-- 40. 插入复杂流程的所有任务
INSERT INTO workflow_task (instance_id, instance_no, node_id, node_key, node_name, node_type, assignee_id, assignee_name, status, comment, create_time, complete_time, priority) VALUES
(9, 'WF202401010002', 6, 'dept_manager', '部门主管审批', 'APPROVE', 'manager001', '张经理', 'APPROVED', '同意', '2024-01-10 08:00:00', '2024-01-10 10:00:00', 1),
(9, 'WF202401010002', 9, 'general_manager', '总经理审批', 'APPROVE', 'ceo001', '赵总', 'APPROVED', '金额较大，需严格控制', '2024-01-10 14:00:00', '2024-01-11 09:00:00', 1),
(9, 'WF202401010002', 10, 'end', '结束', 'END', 'system', '系统', 'APPROVED', '流程结束', '2024-01-11 09:00:00', '2024-01-11 17:00:00', 1);

-- 41. 插入复杂流程的历史记录
INSERT INTO workflow_history (instance_id, task_id, node_id, node_name, action, operator_id, operator_name, comment, operate_time, duration) VALUES
(9, NULL, 5, '开始', 'START', 'user001', '张三', '发起采购申请', '2024-01-10 08:00:00', 0),
(9, 1, 6, '部门主管审批', 'APPROVE', 'manager001', '张经理', '同意', '2024-01-10 10:00:00', 7200000),
(9, 2, 7, '金额判断', 'START', 'system', '系统', '条件判断：金额>=10000，走总经理审批', '2024-01-10 10:00:00', 0),
(9, 3, 9, '总经理审批', 'APPROVE', 'ceo001', '赵总', '金额较大，需严格控制', '2024-01-11 09:00:00', 82800000),
(9, 4, 10, '结束', 'APPROVE', 'system', '系统', '流程完成', '2024-01-11 17:00:00', 28800000);

-- 42. 插入流程变量（复杂流程）
INSERT INTO workflow_variable (instance_id, var_key, var_value, var_type) VALUES
(9, 'amount', '120000', 'NUMBER'),
(9, 'itemName', '电脑设备', 'STRING'),
(9, 'supplier', '科技公司', 'STRING'),
(9, 'conditionResult', '>=10000', 'STRING');

-- 提交事务
COMMIT;

-- ====================================
-- 流程模板测试数据
-- ====================================

-- 1. 插入流程模板
INSERT INTO workflow_template (id, template_key, template_name, template_desc, category, version, status, icon, sort_order, create_by) VALUES
(1, 'simple_approve', '简单审批流程', '适用于简单的单级审批流程', '通用', 1, 1, 'check-circle', 1, 'admin'),
(2, 'multi_approve', '多级审批流程', '适用于需要多级审批的流程', '通用', 1, 1, 'layers', 2, 'admin'),
(3, 'sequential_approve', '顺序审批流程', '适用于依次审批的流程', '通用', 1, 1, 'arrow-right', 3, 'admin'),
(4, 'parallel_approve', '并行审批流程', '适用于需要多人同时审批的流程', '通用', 1, 1, 'git-branch', 4, 'admin'),
(5, 'conditional_approve', '条件审批流程', '适用于根据条件走不同分支的流程', '通用', 1, 1, 'git-commit', 5, 'admin');

-- 2. 插入简单审批流程模板的节点
INSERT INTO workflow_template_node (id, template_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(1, 1, 'start', '开始', 'START', 200, 100, NULL),
(2, 1, 'approve', '审批', 'APPROVE', 400, 100, NULL),
(3, 1, 'end', '结束', 'END', 600, 100, NULL);

-- 3. 插入简单审批流程模板的连线
INSERT INTO workflow_template_edge (id, template_id, source_node_id, target_node_id, condition_expr, priority) VALUES
(1, 1, 1, 2, NULL, 0),
(2, 1, 2, 3, NULL, 0);

-- 4. 插入多级审批流程模板的节点
INSERT INTO workflow_template_node (id, template_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(4, 2, 'start', '开始', 'START', 100, 200, NULL),
(5, 2, 'first_approve', '一级审批', 'APPROVE', 300, 200, NULL),
(6, 2, 'second_approve', '二级审批', 'APPROVE', 500, 200, NULL),
(7, 2, 'third_approve', '三级审批', 'APPROVE', 700, 200, NULL),
(8, 2, 'end', '结束', 'END', 900, 200, NULL);

-- 5. 插入多级审批流程模板的连线
INSERT INTO workflow_template_edge (id, template_id, source_node_id, target_node_id, condition_expr, priority) VALUES
(3, 2, 4, 5, NULL, 0),
(4, 2, 5, 6, NULL, 0),
(5, 2, 6, 7, NULL, 0),
(6, 2, 7, 8, NULL, 0);

-- 6. 插入顺序审批流程模板的节点
INSERT INTO workflow_template_node (id, template_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(9, 3, 'start', '开始', 'START', 100, 200, NULL),
(10, 3, 'approve_1', '审批人1', 'APPROVE', 300, 200, NULL),
(11, 3, 'approve_2', '审批人2', 'APPROVE', 500, 200, NULL),
(12, 3, 'approve_3', '审批人3', 'APPROVE', 700, 200, NULL),
(13, 3, 'end', '结束', 'END', 900, 200, NULL);

-- 7. 插入顺序审批流程模板的连线
INSERT INTO workflow_template_edge (id, template_id, source_node_id, target_node_id, condition_expr, priority) VALUES
(7, 3, 9, 10, NULL, 0),
(8, 3, 10, 11, NULL, 0),
(9, 3, 11, 12, NULL, 0),
(10, 3, 12, 13, NULL, 0);

-- 8. 插入并行审批流程模板的节点
INSERT INTO workflow_template_node (id, template_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(14, 4, 'start', '开始', 'START', 100, 200, NULL),
(15, 4, 'parallel_node', '并行节点', 'APPROVE', 300, 200, NULL),
(16, 4, 'approve_1', '审批人1', 'APPROVE', 500, 100, NULL),
(17, 4, 'approve_2', '审批人2', 'APPROVE', 500, 200, NULL),
(18, 4, 'approve_3', '审批人3', 'APPROVE', 500, 300, NULL),
(19, 4, 'end', '结束', 'END', 700, 200, NULL);

-- 9. 插入并行审批流程模板的连线
INSERT INTO workflow_template_edge (id, template_id, source_node_id, target_node_id, condition_expr, priority) VALUES
(11, 4, 14, 15, NULL, 0),
(12, 4, 15, 16, NULL, 0),
(13, 4, 15, 17, NULL, 0),
(14, 4, 15, 18, NULL, 0),
(15, 4, 16, 19, NULL, 0),
(16, 4, 17, 19, NULL, 0),
(17, 4, 18, 19, NULL, 0);

-- 10. 插入条件审批流程模板的节点
INSERT INTO workflow_template_node (id, template_id, node_key, node_name, node_type, position_x, position_y, config) VALUES
(20, 5, 'start', '开始', 'START', 100, 200, NULL),
(21, 5, 'first_approve', '一级审批', 'APPROVE', 300, 200, NULL),
(22, 5, 'condition', '条件判断', 'CONDITION', 500, 200, NULL),
(23, 5, 'approve_low', '低金额审批', 'APPROVE', 650, 100, NULL),
(24, 5, 'approve_high', '高金额审批', 'APPROVE', 650, 300, NULL),
(25, 5, 'end', '结束', 'END', 850, 200, NULL);

-- 11. 插入条件审批流程模板的连线
INSERT INTO workflow_template_edge (id, template_id, source_node_id, target_node_id, condition_expr, priority) VALUES
(18, 5, 20, 21, NULL, 0),
(19, 5, 21, 22, NULL, 0),
(20, 5, 22, 23, '${amount < 10000}', 1),
(21, 5, 22, 24, '${amount >= 10000}', 2),
(22, 5, 23, 25, NULL, 0),
(23, 5, 24, 25, NULL, 0);

-- 提交事务
COMMIT;
