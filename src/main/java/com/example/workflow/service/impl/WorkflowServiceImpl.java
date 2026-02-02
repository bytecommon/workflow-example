package com.example.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.*;
import com.example.workflow.dto.enums.InstanceStatus;
import com.example.workflow.dto.enums.NodeType;
import com.example.workflow.dto.enums.TaskStatus;
import com.example.workflow.entity.*;

import com.example.workflow.mapper.*;
import com.example.workflow.service.WorkflowService;
import com.example.workflow.service.WorkflowEngineService;
import com.example.workflow.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 工作流服务实现
 */
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {
    
    private final WorkflowDefinitionMapper workflowDefinitionMapper;
    private final WorkflowNodeMapper workflowNodeMapper;
    private final WorkflowEdgeMapper workflowEdgeMapper;
    private final WorkflowApproverMapper workflowApproverMapper;
    private final WorkflowInstanceMapper workflowInstanceMapper;
    private final WorkflowTaskMapper workflowTaskMapper;
    private final WorkflowHistoryMapper workflowHistoryMapper;
    private final WorkflowFormMapper workflowFormMapper;
    private final WorkflowTemplateMapper workflowTemplateMapper;
    private final WorkflowEngineService workflowEngineService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createWorkflowDefinition(WorkflowDefinitionDTO dto) {
        WorkflowDefinition definition = new WorkflowDefinition();
        definition.setWorkflowKey(dto.getWorkflowKey());
        definition.setWorkflowName(dto.getWorkflowName());
        definition.setWorkflowDesc(dto.getWorkflowDesc());
        definition.setCategory(dto.getCategory());
        definition.setTemplateId(dto.getTemplateId());
        definition.setFormId(dto.getFormId());
        definition.setIcon(dto.getIcon());
        definition.setStatus(0); // 初始为停用状态
        definition.setVersion(1);

        workflowDefinitionMapper.insert(definition);
        return definition.getId();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWorkflowDefinition(Long id, WorkflowDefinitionDTO dto) {
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(id);
        if (definition == null) {
            throw new RuntimeException("工作流不存在");
        }

        definition.setWorkflowName(dto.getWorkflowName());
        definition.setWorkflowDesc(dto.getWorkflowDesc());
        definition.setCategory(dto.getCategory());
        definition.setTemplateId(dto.getTemplateId());
        definition.setFormId(dto.getFormId());
        definition.setIcon(dto.getIcon());

        workflowDefinitionMapper.updateById(definition);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkflowDefinition(Long id) {
        // 检查是否有运行中的实例
        Long count = workflowInstanceMapper.selectCount(
            new LambdaQueryWrapper<WorkflowInstance>()
                .eq(WorkflowInstance::getWorkflowId, id)
                .eq(WorkflowInstance::getStatus, InstanceStatus.RUNNING.name())
        );
        
        if (count > 0) {
            throw new RuntimeException("存在运行中的流程实例，无法删除");
        }
        
        workflowDefinitionMapper.deleteById(id);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishWorkflow(Long id) {
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(id);
        if (definition == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        // 验证工作流配置完整性
        validateWorkflowConfig(id);
        
        definition.setStatus(1);
        workflowDefinitionMapper.updateById(definition);
    }
    
    @Override
    public WorkflowDetailVO getWorkflowDetail(Long id) {
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(id);
        if (definition == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        WorkflowDetailVO vo = new WorkflowDetailVO();
        vo.setId(definition.getId());
        vo.setWorkflowKey(definition.getWorkflowKey());
        vo.setWorkflowName(definition.getWorkflowName());
        vo.setWorkflowDesc(definition.getWorkflowDesc());
        vo.setCategory(definition.getCategory());
        vo.setFormId(definition.getFormId());
        vo.setStatus(definition.getStatus());
        
        // 获取节点
        List<WorkflowNode> nodes = workflowNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, id)
        );
        vo.setNodes(nodes);
        
        // 获取连线
        List<WorkflowEdge> edges = workflowEdgeMapper.selectList(
            new LambdaQueryWrapper<WorkflowEdge>()
                .eq(WorkflowEdge::getWorkflowId, id)
        );
        vo.setEdges(edges);
        
        // 获取审批人配置
        if (!nodes.isEmpty()) {
            List<Long> nodeIds = nodes.stream()
                .map(WorkflowNode::getId)
                .collect(Collectors.toList());
            
            List<WorkflowApprover> approvers = workflowApproverMapper.selectList(
                new LambdaQueryWrapper<WorkflowApprover>()
                    .in(WorkflowApprover::getNodeId, nodeIds)
            );
            vo.setApprovers(approvers);
        }
        
        return vo;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveWorkflowConfig(Long workflowId, WorkflowConfigDTO config) {
        // 删除旧配置
        workflowNodeMapper.delete(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, workflowId)
        );

        // 保存节点
        if (config.getNodes() != null && !config.getNodes().isEmpty()) {
            for (WorkflowNode node : config.getNodes()) {
                node.setWorkflowId(workflowId);
                workflowNodeMapper.insert(node);
            }
        }

        // 保存连线
        workflowEdgeMapper.delete(
            new LambdaQueryWrapper<WorkflowEdge>()
                .eq(WorkflowEdge::getWorkflowId, workflowId)
        );

        if (config.getEdges() != null && !config.getEdges().isEmpty()) {
            for (WorkflowEdge edge : config.getEdges()) {
                edge.setWorkflowId(workflowId);
                workflowEdgeMapper.insert(edge);
            }
        }

        // 保存审批人配置（两种方式兼容）
        if (config.getApprovers() != null && !config.getApprovers().isEmpty()) {
            // 方式1：后端直接传递的 approvers
            for (WorkflowApprover approver : config.getApprovers()) {
                workflowApproverMapper.insert(approver);
            }
        } else if (config.getApprovalRules() != null && !config.getApprovalRules().isEmpty()) {
            // 方式2：前端传递的 approvalRules，需要转换
            handleApprovalRules(workflowId, config.getApprovalRules());
        }


        // 处理表单配置
        if (config.getFormSchema() != null) {
            handleFormSchema(workflowId, config.getFormSchema());
        }
    }

    @Override
    public WorkflowConfigDTO getWorkflowConfig(Long workflowId) {
        // 获取流程定义
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(workflowId);
        if (definition == null) {
            throw new RuntimeException("流程定义不存在");
        }

        WorkflowConfigDTO config = new WorkflowConfigDTO();

        // 获取并处理表单配置
        if (definition.getFormId() != null) {
            WorkflowForm form = workflowFormMapper.selectById(definition.getFormId());
            if (form != null && form.getFormConfig() != null) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode configNode = objectMapper.readTree(form.getFormConfig());

                    // 解析表单配置
                    WorkflowConfigDTO.FormSchemaDTO formSchema = new WorkflowConfigDTO.FormSchemaDTO();

                    // 解析基础配置
                    if (configNode.has("config")) {
                        com.fasterxml.jackson.databind.JsonNode configDetails = configNode.get("config");
                        WorkflowConfigDTO.FormConfigDTO formConfigDTO = new WorkflowConfigDTO.FormConfigDTO();
                        if (configDetails.has("title")) {
                            formConfigDTO.setTitle(configDetails.get("title").asText());
                        }
                        if (configDetails.has("description")) {
                            formConfigDTO.setDescription(configDetails.get("description").asText());
                        }
                        if (configDetails.has("submitText")) {
                            formConfigDTO.setSubmitText(configDetails.get("submitText").asText());
                        }
                        formSchema.setConfig(formConfigDTO);
                    }

                    // 解析字段配置
                    if (configNode.has("fields")) {
                        com.fasterxml.jackson.databind.JsonNode fieldsNode = configNode.get("fields");
                        java.util.List<WorkflowConfigDTO.FormFieldDTO> fields = new java.util.ArrayList<>();
                        for (com.fasterxml.jackson.databind.JsonNode fieldNode : fieldsNode) {
                            WorkflowConfigDTO.FormFieldDTO field = new WorkflowConfigDTO.FormFieldDTO();
                            if (fieldNode.has("name")) {
                                field.setName(fieldNode.get("name").asText());
                            }
                            if (fieldNode.has("label")) {
                                field.setLabel(fieldNode.get("label").asText());
                            }
                            if (fieldNode.has("type")) {
                                field.setType(fieldNode.get("type").asText());
                            }
                            if (fieldNode.has("required")) {
                                field.setRequired(fieldNode.get("required").asBoolean());
                            }
                            if (fieldNode.has("options")) {
                                java.util.List<String> options = new java.util.ArrayList<>();
                                com.fasterxml.jackson.databind.JsonNode optionsNode = fieldNode.get("options");
                                for (com.fasterxml.jackson.databind.JsonNode optionNode : optionsNode) {
                                    options.add(optionNode.asText());
                                }
                                field.setOptions(options);
                            }
                            if (fieldNode.has("placeholder")) {
                                field.setPlaceholder(fieldNode.get("placeholder").asText());
                            }
                            fields.add(field);
                        }
                        formSchema.setFields(fields);
                    }

                    config.setFormSchema(formSchema);
                } catch (Exception e) {
                    System.err.println("解析表单配置失败: " + e.getMessage());
                }
            }
        }

        // 获取并转换审批规则
        java.util.List<WorkflowApprover> approvers = workflowApproverMapper.selectList(
            new LambdaQueryWrapper<WorkflowApprover>()
                .inSql(WorkflowApprover::getNodeId,
                    "SELECT id FROM workflow_node WHERE workflow_id = " + workflowId)
        );

        if (approvers != null && !approvers.isEmpty()) {
            // 获取节点信息，建立 nodeId 到 nodeKey 的映射
            java.util.List<WorkflowNode> nodes = workflowNodeMapper.selectList(
                new LambdaQueryWrapper<WorkflowNode>()
                    .eq(WorkflowNode::getWorkflowId, workflowId)
            );
            java.util.Map<Long, String> nodeIdToKeyMap = new java.util.HashMap<>();
            for (WorkflowNode node : nodes) {
                nodeIdToKeyMap.put(node.getId(), node.getNodeKey());
            }

            // 将审批人配置转换为审批规则
            java.util.List<WorkflowConfigDTO.ApprovalRuleDTO> approvalRules = new java.util.ArrayList<>();
            for (WorkflowApprover approver : approvers) {
                WorkflowConfigDTO.ApprovalRuleDTO rule = new WorkflowConfigDTO.ApprovalRuleDTO();
                rule.setId(approver.getId());
                rule.setNodeId(nodeIdToKeyMap.get(approver.getNodeId()));
                rule.setNodeName("节点" + approver.getNodeId());

                // 根据 approveMode 确定 ruleType
                String approveMode = approver.getApproveMode();
                if ("AND".equals(approveMode)) {
                    rule.setRuleType("multi");
                } else if ("SEQUENTIAL".equals(approveMode)) {
                    rule.setRuleType("sequential");
                } else {
                    rule.setRuleType("single");
                }

                // 解析审批人
                if (approver.getApproverValue() != null && !approver.getApproverValue().isEmpty()) {
                    String[] approverArray = approver.getApproverValue().split(",");
                    rule.setApprovers(java.util.Arrays.asList(approverArray));
                }

                approvalRules.add(rule);
            }
            config.setApprovalRules(approvalRules);
        }

        return config;
    }

    /**
     * 处理审批规则，转换为后端的审批人配置
     */
    private void handleApprovalRules(Long workflowId, java.util.List<WorkflowConfigDTO.ApprovalRuleDTO> approvalRules) {
        // 先获取流程中所有节点，建立 nodeKey 到 nodeId 的映射
        java.util.List<WorkflowNode> nodes = workflowNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, workflowId)
        );
        java.util.Map<String, Long> nodeKeyToIdMap = new java.util.HashMap<>();
        for (WorkflowNode node : nodes) {
            nodeKeyToIdMap.put(node.getNodeKey(), node.getId());
        }

        for (WorkflowConfigDTO.ApprovalRuleDTO rule : approvalRules) {
            // 根据 ruleType 确定 approveMode
            String approveMode = "OR";  // 默认
            if ("multi".equals(rule.getRuleType())) {
                approveMode = "AND";  // 会签
            } else if ("sequential".equals(rule.getRuleType())) {
                approveMode = "SEQUENTIAL";  // 顺序审批
            }

            // 确定审批人类型
            String approverType = "USER";  // 默认
            String approverValue = "";

            // 如果有多个审批人，使用多选方式
            if (rule.getApprovers() != null && !rule.getApprovers().isEmpty()) {
                if (rule.getApprovers().size() == 1) {
                    // 单个审批人
                    approverType = "USER";
                    approverValue = rule.getApprovers().get(0);
                } else {
                    // 多个审批人
                    approverType = "USER";
                    // 将多个审批人拼接成一个字符串，用逗号分隔
                    approverValue = String.join(",", rule.getApprovers());
                }
            }

            // 查找对应的节点ID
            Long nodeId = nodeKeyToIdMap.get(rule.getNodeId());
            if (nodeId == null) {
                // 如果找不到节点，跳过这个审批规则
                System.err.println("找不到节点: " + rule.getNodeId());
                continue;
            }

            // 创建审批人配置
            WorkflowApprover approver = new WorkflowApprover();
            approver.setNodeId(nodeId);
            approver.setApproverType(approverType);
            approver.setApproverValue(approverValue);
            approver.setApproveMode(approveMode);
            approver.setNobodyHandler("AUTO_PASS");  // 默认自动通过

            workflowApproverMapper.insert(approver);
        }
    }

    /**
     * 处理表单配置，创建或更新表单
     */
    private void handleFormSchema(Long workflowId, WorkflowConfigDTO.FormSchemaDTO formSchema) {
        try {
            // 获取流程定义
            WorkflowDefinition definition = workflowDefinitionMapper.selectById(workflowId);
            if (definition == null) {
                throw new RuntimeException("流程定义不存在");
            }

            // 如果流程定义有关联表单，更新它；否则创建新表单
            Long formId = definition.getFormId();
            WorkflowForm form;

            if (formId != null) {
                // 更新现有表单
                form = workflowFormMapper.selectById(formId);
                if (form == null) {
                    // 表单不存在，创建新的
                    form = new WorkflowForm();
                    form.setFormKey(generateFormKey(definition.getWorkflowName()));
                }
            } else {
                // 创建新表单
                form = new WorkflowForm();
                form.setFormKey(generateFormKey(definition.getWorkflowName()));
            }

            // 设置表单基础信息
            form.setFormName(formSchema.getConfig() != null ? formSchema.getConfig().getTitle() : definition.getWorkflowName() + "表单");
            form.setFormDesc(formSchema.getConfig() != null ? formSchema.getConfig().getDescription() : null);
            form.setStatus(1);

            // 构建表单配置JSON，只保存需要的字段
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode configNode = objectMapper.createObjectNode();

            // 保存配置信息
            if (formSchema.getConfig() != null) {
                com.fasterxml.jackson.databind.node.ObjectNode configDetails = objectMapper.createObjectNode();
                configDetails.put("title", formSchema.getConfig().getTitle());
                configDetails.put("description", formSchema.getConfig().getDescription());
                configDetails.put("submitText", formSchema.getConfig().getSubmitText());
                configNode.set("config", configDetails);
            }

            // 保存字段信息
            if (formSchema.getFields() != null) {
                com.fasterxml.jackson.databind.node.ArrayNode fieldsNode = objectMapper.createArrayNode();
                for (WorkflowConfigDTO.FormFieldDTO field : formSchema.getFields()) {
                    com.fasterxml.jackson.databind.node.ObjectNode fieldNode = objectMapper.createObjectNode();

                    // 确定字段标识（name）和标签（label）
                    String fieldName;  // 字段标识
                    String fieldLabel;  // 字段标签

                    if (field.getFieldName() != null && !field.getFieldName().isEmpty()) {
                        // 如果有明确的 fieldName，使用它
                        fieldName = field.getFieldName();
                        fieldLabel = field.getName();
                    } else {
                        // 否则，name 就是标签，需要生成字段标识
                        fieldLabel = field.getName();
                        fieldName = generateFieldNameFromLabel(field.getName());
                    }

                    fieldNode.put("name", fieldName);
                    fieldNode.put("label", fieldLabel);
                    fieldNode.put("type", field.getType());
                    fieldNode.put("required", field.getRequired());
                    if (field.getOptions() != null) {
                        com.fasterxml.jackson.databind.node.ArrayNode optionsNode = objectMapper.createArrayNode();
                        for (String option : field.getOptions()) {
                            optionsNode.add(option);
                        }
                        fieldNode.set("options", optionsNode);
                    }
                    if (field.getPlaceholder() != null) {
                        fieldNode.put("placeholder", field.getPlaceholder());
                    }
                    fieldsNode.add(fieldNode);
                }
                configNode.set("fields", fieldsNode);
            }

            String formConfigJson = objectMapper.writeValueAsString(configNode);
            form.setFormConfig(formConfigJson);

            // 保存表单
            if (formId != null) {
                workflowFormMapper.updateById(form);
            } else {
                workflowFormMapper.insert(form);
                // 更新流程定义的表单ID
                definition.setFormId(form.getId());
                workflowDefinitionMapper.updateById(definition);
            }

        } catch (Exception e) {
            throw new RuntimeException("保存表单配置失败: " + e.getMessage(), e);
        }
    }

    /**
     * 根据流程名称生成表单key
     */
    private String generateFormKey(String workflowName) {
        if (workflowName == null || workflowName.isEmpty()) {
            return "custom_form_" + System.currentTimeMillis();
        }
        // 将中文转换为拼音或直接使用英文，这里简化处理
        return workflowName.replaceAll("[\\s\\p{P}\\p{Z}\\p{C}]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "")
                .toLowerCase() + "_form";
    }

    /**
     * 根据字段标签生成字段标识
     */
    private String generateFieldNameFromLabel(String label) {
        if (label == null || label.isEmpty()) {
            return "field_" + System.currentTimeMillis();
        }

        // 常见字段映射
        java.util.Map<String, String> fieldMapping = new java.util.HashMap<>();
        fieldMapping.put("标题", "title");
        fieldMapping.put("描述", "description");
        fieldMapping.put("优先级", "priority");
        fieldMapping.put("名称", "name");
        fieldMapping.put("数量", "quantity");
        fieldMapping.put("金额", "amount");
        fieldMapping.put("类型", "type");
        fieldMapping.put("日期", "date");
        fieldMapping.put("开始日期", "startDate");
        fieldMapping.put("结束日期", "endDate");
        fieldMapping.put("天数", "days");
        fieldMapping.put("原因", "reason");
        fieldMapping.put("供应商", "supplier");
        fieldMapping.put("物品名称", "itemName");
        fieldMapping.put("费用类型", "expenseType");
        fieldMapping.put("费用说明", "explanation");
        fieldMapping.put("出差类型", "tripType");
        fieldMapping.put("出差地点", "destination");
        fieldMapping.put("预算", "budget");
        fieldMapping.put("印章类型", "sealType");
        fieldMapping.put("文件名称", "docName");
        fieldMapping.put("文件份数", "docCount");
        fieldMapping.put("用印事由", "usage");
        fieldMapping.put("请假类型", "leaveType");
        fieldMapping.put("请假天数", "leaveDays");

        // 如果有映射，使用映射值
        if (fieldMapping.containsKey(label)) {
            return fieldMapping.get(label);
        }

        // 否则，移除特殊字符，转换为小写，添加 _field 后缀
        return label.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "")
                .toLowerCase() + "_field";
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long startWorkflow(WorkflowStartDTO dto) {
        // 获取工作流定义
        WorkflowDefinition definition = workflowDefinitionMapper.selectOne(
            new LambdaQueryWrapper<WorkflowDefinition>()
                .eq(WorkflowDefinition::getId, dto.getWorkflowId())
                .eq(WorkflowDefinition::getStatus, 1)
        );
        
        if (definition == null) {
            throw new RuntimeException("工作流不存在或未启用");
        }
        
        // 创建流程实例
        WorkflowInstance instance = new WorkflowInstance();
        instance.setInstanceNo(generateInstanceNo());
        instance.setWorkflowId(definition.getId());
        instance.setWorkflowKey(definition.getWorkflowKey());
        instance.setWorkflowName(definition.getWorkflowName());
        instance.setFormId(definition.getFormId());
        instance.setFormData(dto.getFormData());
        instance.setStatus(InstanceStatus.RUNNING.name());
        instance.setStartUserId(dto.getStartUserId());
        instance.setStartUserName(dto.getStartUserName());
        instance.setTitle(dto.getTitle());
        instance.setPriority(dto.getPriority());
        instance.setBusinessKey(dto.getBusinessKey());
        
        workflowInstanceMapper.insert(instance);
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(instance.getId());
        history.setNodeId(0L);
        history.setNodeName("开始");
        history.setAction("START");
        history.setOperatorId(dto.getStartUserId());
        history.setOperatorName(dto.getStartUserName());
        history.setComment("发起流程");
        workflowHistoryMapper.insert(history);
        
        // 启动流程引擎，执行到第一个审批节点
        workflowEngineService.startProcess(instance.getId());
        
        return instance.getId();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveTask(Long taskId, TaskApproveDTO dto) {
        WorkflowTask task = workflowTaskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!TaskStatus.PENDING.name().equals(task.getStatus())) {
            throw new RuntimeException("任务已处理");
        }
        
        // 更新任务状态
        task.setStatus(dto.isApproved() ? TaskStatus.APPROVED.name() : TaskStatus.REJECTED.name());
        task.setComment(dto.getComment());
        task.setAttachments(dto.getAttachments());
        task.setCompleteTime(LocalDateTime.now());
        workflowTaskMapper.updateById(task);
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(task.getInstanceId());
        history.setTaskId(task.getId());
        history.setNodeId(task.getNodeId());
        history.setNodeName(task.getNodeName());
        history.setAction(dto.isApproved() ? "APPROVE" : "REJECT");
        history.setOperatorId(dto.getOperatorId());
        history.setOperatorName(dto.getOperatorName());
        history.setComment(dto.getComment());
        history.setAttachments(dto.getAttachments());
        workflowHistoryMapper.insert(history);
        
        // 执行流程引擎
        workflowEngineService.processTask(task.getInstanceId(), taskId, dto.isApproved());
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transferTask(Long taskId, TaskTransferDTO dto) {
        WorkflowTask task = workflowTaskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!TaskStatus.PENDING.name().equals(task.getStatus())) {
            throw new RuntimeException("任务已处理");
        }
        
        // 更新原任务为已转交
        task.setStatus(TaskStatus.TRANSFERRED.name());
        task.setComment("转交给：" + dto.getTargetUserName());
        task.setCompleteTime(LocalDateTime.now());
        workflowTaskMapper.updateById(task);
        
        // 创建新任务
        WorkflowTask newTask = new WorkflowTask();
        newTask.setInstanceId(task.getInstanceId());
        newTask.setInstanceNo(task.getInstanceNo());
        newTask.setNodeId(task.getNodeId());
        newTask.setNodeKey(task.getNodeKey());
        newTask.setNodeName(task.getNodeName());
        newTask.setNodeType(task.getNodeType());
        newTask.setAssigneeId(dto.getTargetUserId());
        newTask.setAssigneeName(dto.getTargetUserName());
        newTask.setStatus(TaskStatus.PENDING.name());
        newTask.setPriority(task.getPriority());
        workflowTaskMapper.insert(newTask);
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(task.getInstanceId());
        history.setTaskId(task.getId());
        history.setNodeId(task.getNodeId());
        history.setNodeName(task.getNodeName());
        history.setAction("TRANSFER");
        history.setOperatorId(dto.getOperatorId());
        history.setOperatorName(dto.getOperatorName());
        history.setComment("转交给：" + dto.getTargetUserName() + "。原因：" + dto.getReason());
        workflowHistoryMapper.insert(history);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelInstance(Long instanceId, String reason) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }
        
        if (!InstanceStatus.RUNNING.name().equals(instance.getStatus())) {
            throw new RuntimeException("流程已结束");
        }
        
        // 更新实例状态
        instance.setStatus(InstanceStatus.CANCELED.name());
        instance.setEndTime(LocalDateTime.now());
        workflowInstanceMapper.updateById(instance);
        
        // 取消待办任务
        workflowTaskMapper.update(null,
            new LambdaUpdateWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
                    .set(WorkflowTask::getStatus, TaskStatus.CANCELED.name())
        );
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(instanceId);
        history.setNodeId(instance.getCurrentNodeId());
        history.setNodeName("撤销");
        history.setAction("CANCEL");
        history.setOperatorId(instance.getStartUserId());
        history.setOperatorName(instance.getStartUserName());
        history.setComment(reason);
        workflowHistoryMapper.insert(history);
    }
    
    @Override
    public Page<TaskVO> getMyPendingTasks(TaskQueryDTO query) {
        Page<WorkflowTask> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        LambdaQueryWrapper<WorkflowTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkflowTask::getAssigneeId, query.getUserId())
               .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
               .orderByDesc(WorkflowTask::getCreateTime);
        
        Page<WorkflowTask> taskPage = workflowTaskMapper.selectPage(page, wrapper);
        
        // 转换为VO
        Page<TaskVO> voPage = new Page<>();
        voPage.setCurrent(taskPage.getCurrent());
        voPage.setSize(taskPage.getSize());
        voPage.setTotal(taskPage.getTotal());
        
        List<TaskVO> voList = taskPage.getRecords().stream()
            .map(this::convertToTaskVO)
            .collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }
    
    @Override
    public Page<InstanceVO> getMyInstances(InstanceQueryDTO query) {
        Page<WorkflowInstance> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        LambdaQueryWrapper<WorkflowInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkflowInstance::getStartUserId, query.getUserId())
               .orderByDesc(WorkflowInstance::getStartTime);
        
        if (query.getStatus() != null) {
            wrapper.eq(WorkflowInstance::getStatus, query.getStatus());
        }
        
        Page<WorkflowInstance> instancePage = workflowInstanceMapper.selectPage(page, wrapper);
        
        // 转换为VO
        Page<InstanceVO> voPage = new Page<>();
        voPage.setCurrent(instancePage.getCurrent());
        voPage.setSize(instancePage.getSize());
        voPage.setTotal(instancePage.getTotal());
        
        List<InstanceVO> voList = instancePage.getRecords().stream()
            .map(this::convertToInstanceVO)
            .collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }
    
    @Override
    public InstanceDetailVO getInstanceDetail(Long instanceId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }

        InstanceDetailVO vo = new InstanceDetailVO();
        vo.setId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setWorkflowName(instance.getWorkflowName());
        vo.setStatus(instance.getStatus());
        vo.setFormData(instance.getFormData());
        vo.setStartUserId(instance.getStartUserId());
        vo.setStartUserName(instance.getStartUserName());
        vo.setStartTime(instance.getStartTime());
        vo.setEndTime(instance.getEndTime());
        vo.setTitle(instance.getTitle());

        return vo;
    }

    @Override
    public InstanceInfoVO getInstanceInfo(Long instanceId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }

        // 获取当前正在处理的任务
        WorkflowTask currentTask = workflowTaskMapper.selectOne(
            new LambdaQueryWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
                .last("LIMIT 1")
        );

        InstanceInfoVO vo = new InstanceInfoVO();
        vo.setId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setDefinitionId(instance.getWorkflowId());
        vo.setWorkflowName(instance.getWorkflowName());
        vo.setStatus(instance.getStatus());
        vo.setTitle(instance.getTitle());
        vo.setStartUserId(instance.getStartUserId());
        vo.setStartUserName(instance.getStartUserName());
        vo.setStartTime(instance.getStartTime());
        vo.setEndTime(instance.getEndTime());
        vo.setPriority(instance.getPriority());

        if (currentTask != null) {
            vo.setCurrentNodeName(currentTask.getNodeName());
        }

        return vo;
    }

    @Override
    public InstanceFormDataVO getInstanceFormData(Long instanceId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }

        InstanceFormDataVO vo = new InstanceFormDataVO();
        vo.setInstanceId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setFormId(instance.getFormId());
        vo.setFormData(instance.getFormData());

        // 如果有关联表单，获取表单信息
        if (instance.getFormId() != null) {
            WorkflowForm form = workflowFormMapper.selectById(instance.getFormId());
            if (form != null) {
                vo.setFormName(form.getFormName());
                vo.setFormConfig(form.getFormConfig());
                
                // 解析表单数据为Map
                if (instance.getFormData() != null && !instance.getFormData().isEmpty()) {
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> dataMap = objectMapper.readValue(
                            instance.getFormData(),
                            new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {}
                        );
                        vo.setDataMap(dataMap);
                    } catch (Exception e) {
                        // 解析失败，不设置dataMap，前端会尝试解析formData
                        System.err.println("解析表单数据失败: " + e.getMessage());
                    }
                }
            }
        }

        return vo;
    }

    @Override
    public InstanceGraphVO getInstanceGraph(Long instanceId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }

        // 获取工作流定义的节点和连线
        List<WorkflowNode> nodes = workflowNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, instance.getWorkflowId())
        );

        List<WorkflowEdge> edges = workflowEdgeMapper.selectList(
            new LambdaQueryWrapper<WorkflowEdge>()
                .eq(WorkflowEdge::getWorkflowId, instance.getWorkflowId())
        );

        // 获取当前任务节点
        WorkflowTask currentTask = workflowTaskMapper.selectOne(
            new LambdaQueryWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
                .last("LIMIT 1")
        );

        // 获取已完成的任务节点
        List<WorkflowTask> completedTasks = workflowTaskMapper.selectList(
            new LambdaQueryWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getStatus, TaskStatus.APPROVED.name())
        );

        InstanceGraphVO vo = new InstanceGraphVO();
        vo.setInstanceId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setWorkflowName(instance.getWorkflowName());
        vo.setStatus(instance.getStatus());
        vo.setNodes(nodes);
        vo.setEdges(edges);

        if (currentTask != null) {
            vo.setCurrentNodeId(currentTask.getNodeId());
        }

        List<Long> completedNodeIds = completedTasks.stream()
            .map(WorkflowTask::getNodeId)
            .distinct()
            .collect(Collectors.toList());
        vo.setCompletedNodeIds(completedNodeIds);

        return vo;
    }

    @Override
    public List<TaskVO> getInstanceTasks(Long instanceId) {
        List<WorkflowTask> tasks = workflowTaskMapper.selectList(
            new LambdaQueryWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .orderByAsc(WorkflowTask::getCreateTime)
        );

        return tasks.stream()
            .map(this::convertToTaskVO)
            .collect(Collectors.toList());
    }

    @Override
    public List<HistoryVO> getInstanceHistory(Long instanceId) {
        List<WorkflowHistory> histories = workflowHistoryMapper.selectList(
            new LambdaQueryWrapper<WorkflowHistory>()
                .eq(WorkflowHistory::getInstanceId, instanceId)
                .orderByAsc(WorkflowHistory::getOperateTime)
        );

        return histories.stream()
            .map(this::convertToHistoryVO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<WorkflowDefinitionVO> getWorkflowDefinitions(WorkflowDefinitionQueryDTO query) {
        Page<WorkflowDefinition> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        LambdaQueryWrapper<WorkflowDefinition> wrapper = new LambdaQueryWrapper<>();
        
        // 条件查询
        if (query.getWorkflowName() != null && !query.getWorkflowName().trim().isEmpty()) {
            wrapper.like(WorkflowDefinition::getWorkflowName, query.getWorkflowName().trim());
        }
        
        if (query.getCategory() != null && !query.getCategory().trim().isEmpty()) {
            wrapper.eq(WorkflowDefinition::getCategory, query.getCategory().trim());
        }
        
        if (query.getStatus() != null) {
            wrapper.eq(WorkflowDefinition::getStatus, query.getStatus());
        }
        
        // 排序：按创建时间倒序，再按排序序号升序
        wrapper.orderByDesc(WorkflowDefinition::getCreateTime)
               .orderByAsc(WorkflowDefinition::getSortOrder);
        
        Page<WorkflowDefinition> definitionPage = workflowDefinitionMapper.selectPage(page, wrapper);
        
        // 转换为VO
        Page<WorkflowDefinitionVO> voPage = new Page<>();
        voPage.setCurrent(definitionPage.getCurrent());
        voPage.setSize(definitionPage.getSize());
        voPage.setTotal(definitionPage.getTotal());
        
        List<WorkflowDefinitionVO> voList = definitionPage.getRecords().stream()
            .map(this::convertToWorkflowDefinitionVO)
            .collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }
    
    // ========== 私有方法 ==========
    
    private void validateWorkflowConfig(Long workflowId) {
        // 验证是否有开始节点和结束节点
        List<WorkflowNode> nodes = workflowNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, workflowId)
        );
        
        if (nodes.isEmpty()) {
            throw new RuntimeException("工作流未配置节点");
        }
        
        boolean hasStart = nodes.stream().anyMatch(n -> NodeType.START.name().equals(n.getNodeType()));
        boolean hasEnd = nodes.stream().anyMatch(n -> NodeType.END.name().equals(n.getNodeType()));
        
        if (!hasStart || !hasEnd) {
            throw new RuntimeException("工作流必须包含开始节点和结束节点");
        }
    }
    
    private String generateInstanceNo() {
        return "WF" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private TaskVO convertToTaskVO(WorkflowTask task) {
        TaskVO vo = new TaskVO();
        vo.setId(task.getId());
        vo.setInstanceId(task.getInstanceId());
        vo.setInstanceNo(task.getInstanceNo());
        vo.setNodeName(task.getNodeName());
        vo.setStatus(task.getStatus());
        vo.setCreateTime(task.getCreateTime());
        vo.setPriority(task.getPriority());
        
        // 获取流程实例信息
        WorkflowInstance instance = workflowInstanceMapper.selectById(task.getInstanceId());
        if (instance != null) {
            vo.setWorkflowName(instance.getWorkflowName());
            vo.setTitle(instance.getTitle());
            vo.setStartUserName(instance.getStartUserName());
        }
        
        return vo;
    }
    
    private InstanceVO convertToInstanceVO(WorkflowInstance instance) {
        InstanceVO vo = new InstanceVO();
        vo.setId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setWorkflowName(instance.getWorkflowName());
        vo.setStatus(instance.getStatus());
        vo.setTitle(instance.getTitle());
        vo.setStartTime(instance.getStartTime());
        vo.setEndTime(instance.getEndTime());
        vo.setPriority(instance.getPriority());
        return vo;
    }
    
    private HistoryVO convertToHistoryVO(WorkflowHistory history) {
        HistoryVO vo = new HistoryVO();
        vo.setId(history.getId());
        vo.setNodeName(history.getNodeName());
        vo.setAction(history.getAction());
        vo.setOperatorName(history.getOperatorName());
        vo.setComment(history.getComment());
        vo.setOperateTime(history.getOperateTime());
        vo.setDuration(history.getDuration());
        return vo;
    }

    private WorkflowDefinitionVO convertToWorkflowDefinitionVO(WorkflowDefinition definition) {
        WorkflowDefinitionVO vo = new WorkflowDefinitionVO();
        vo.setId(definition.getId());
        vo.setWorkflowKey(definition.getWorkflowKey());
        vo.setWorkflowName(definition.getWorkflowName());
        vo.setWorkflowDesc(definition.getWorkflowDesc());
        vo.setCategory(definition.getCategory());
        vo.setTemplateId(definition.getTemplateId());
        vo.setVersion(definition.getVersion());
        vo.setStatus(definition.getStatus());
        vo.setFormId(definition.getFormId());
        vo.setIcon(definition.getIcon());
        vo.setSortOrder(definition.getSortOrder());
        vo.setCreateBy(definition.getCreateBy());
        vo.setCreateTime(definition.getCreateTime());
        vo.setUpdateBy(definition.getUpdateBy());
        vo.setUpdateTime(definition.getUpdateTime());

        // 查询模板名称
        if (definition.getTemplateId() != null) {
            com.example.workflow.entity.WorkflowTemplate template = workflowTemplateMapper.selectById(definition.getTemplateId());
            if (template != null) {
                vo.setTemplateName(template.getTemplateName());
            }
        }

        return vo;
    }
}
