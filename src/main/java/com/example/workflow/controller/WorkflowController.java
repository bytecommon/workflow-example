package com.example.workflow.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.*;
import com.example.workflow.service.WorkflowService;
import com.example.workflow.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import java.util.List;

/**
 * 工作流控制器
 */
@Tag(name = "工作流管理")
@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
public class WorkflowController {
    
    private final WorkflowService workflowService;
    
    @Operation(summary = "创建工作流定义")
    @PostMapping("/definition")
    public Result<Long> createDefinition(@Valid @RequestBody WorkflowDefinitionDTO dto) {
        Long id = workflowService.createWorkflowDefinition(dto);
        return Result.success(id);
    }
    
    @Operation(summary = "更新工作流定义")
    @PutMapping("/definition/{id}")
    public Result<Void> updateDefinition(@PathVariable Long id, 
                                        @Valid @RequestBody WorkflowDefinitionDTO dto) {
        workflowService.updateWorkflowDefinition(id, dto);
        return Result.success();
    }
    
    @Operation(summary = "删除工作流定义")
    @DeleteMapping("/definition/{id}")
    public Result<Void> deleteDefinition(@PathVariable Long id) {
        workflowService.deleteWorkflowDefinition(id);
        return Result.success();
    }
    
    @Operation(summary = "发布工作流")
    @PostMapping("/definition/{id}/publish")
    public Result<Void> publishWorkflow(@PathVariable Long id) {
        workflowService.publishWorkflow(id);
        return Result.success();
    }
    
    @Operation(summary = "获取工作流详情")
    @GetMapping("/definition/{id}")
    public Result<WorkflowDetailVO> getWorkflowDetail(@PathVariable Long id) {
        WorkflowDetailVO detail = workflowService.getWorkflowDetail(id);
        return Result.success(detail);
    }
    
    @Operation(summary = "获取流程定义列表")
    @GetMapping("/definition")
    public Result<Page<WorkflowDefinitionVO>> getDefinitions(@Valid WorkflowDefinitionQueryDTO query) {
        Page<WorkflowDefinitionVO> page = workflowService.getWorkflowDefinitions(query);
        return Result.success(page);
    }
    
    @Operation(summary = "保存工作流配置")
    @PostMapping("/definition/{id}/config")
    public Result<Void> saveConfig(@PathVariable Long id, 
                                   @Valid @RequestBody WorkflowConfigDTO config) {
        workflowService.saveWorkflowConfig(id, config);
        return Result.success();
    }
    
    @Operation(summary = "启动工作流")
    @PostMapping("/instance/start")
    public Result<Long> startWorkflow(@Valid @RequestBody WorkflowStartDTO dto) {
        Long instanceId = workflowService.startWorkflow(dto);
        return Result.success(instanceId);
    }
    
    @Operation(summary = "审批任务")
    @PostMapping("/task/{taskId}/approve")
    public Result<Void> approveTask(@PathVariable Long taskId, 
                                    @Valid @RequestBody TaskApproveDTO dto) {
        workflowService.approveTask(taskId, dto);
        return Result.success();
    }
    
    @Operation(summary = "转交任务")
    @PostMapping("/task/{taskId}/transfer")
    public Result<Void> transferTask(@PathVariable Long taskId, 
                                     @Valid @RequestBody TaskTransferDTO dto) {
        workflowService.transferTask(taskId, dto);
        return Result.success();
    }
    
    @Operation(summary = "撤销流程")
    @PostMapping("/instance/{instanceId}/cancel")
    public Result<Void> cancelInstance(@PathVariable Long instanceId, 
                                       @RequestParam String reason) {
        workflowService.cancelInstance(instanceId, reason);
        return Result.success();
    }
    
    @Operation(summary = "获取我的待办任务")
    @GetMapping("/task/pending")
    public Result<Page<TaskVO>> getMyPendingTasks(@Valid TaskQueryDTO query) {
        Page<TaskVO> page = workflowService.getMyPendingTasks(query);
        return Result.success(page);
    }
    
    @Operation(summary = "获取我发起的流程")
    @GetMapping("/instance/my")
    public Result<Page<InstanceVO>> getMyInstances(@Valid InstanceQueryDTO query) {
        Page<InstanceVO> page = workflowService.getMyInstances(query);
        return Result.success(page);
    }
    
    @Operation(summary = "获取流程实例详情")
    @GetMapping("/instance/{instanceId}")
    public Result<InstanceDetailVO> getInstanceDetail(@PathVariable Long instanceId) {
        InstanceDetailVO detail = workflowService.getInstanceDetail(instanceId);
        return Result.success(detail);
    }

    @Operation(summary = "获取流程实例基本信息")
    @GetMapping("/instance/{instanceId}/info")
    public Result<InstanceInfoVO> getInstanceInfo(@PathVariable Long instanceId) {
        InstanceInfoVO info = workflowService.getInstanceInfo(instanceId);
        return Result.success(info);
    }

    @Operation(summary = "获取流程实例表单数据")
    @GetMapping("/instance/{instanceId}/form")
    public Result<InstanceFormDataVO> getInstanceFormData(@PathVariable Long instanceId) {
        InstanceFormDataVO formData = workflowService.getInstanceFormData(instanceId);
        return Result.success(formData);
    }

    @Operation(summary = "获取流程实例流程图")
    @GetMapping("/instance/{instanceId}/graph")
    public Result<InstanceGraphVO> getInstanceGraph(@PathVariable Long instanceId) {
        InstanceGraphVO graph = workflowService.getInstanceGraph(instanceId);
        return Result.success(graph);
    }

    @Operation(summary = "获取流程实例任务列表")
    @GetMapping("/instance/{instanceId}/tasks")
    public Result<List<TaskVO>> getInstanceTasks(@PathVariable Long instanceId) {
        List<TaskVO> tasks = workflowService.getInstanceTasks(instanceId);
        return Result.success(tasks);
    }

    @Operation(summary = "获取流程审批历史")
    @GetMapping("/instance/{instanceId}/history")
    public Result<List<HistoryVO>> getInstanceHistory(@PathVariable Long instanceId) {
        List<HistoryVO> history = workflowService.getInstanceHistory(instanceId);
        return Result.success(history);
    }
}
