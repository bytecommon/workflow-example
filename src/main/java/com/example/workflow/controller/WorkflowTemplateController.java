package com.example.workflow.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.WorkflowTemplateConfigDTO;
import com.example.workflow.dto.WorkflowTemplateDTO;
import com.example.workflow.dto.WorkflowTemplateQueryDTO;
import com.example.workflow.service.WorkflowTemplateService;
import com.example.workflow.vo.Result;
import com.example.workflow.vo.WorkflowTemplateDetailVO;
import com.example.workflow.vo.WorkflowTemplateVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 流程模板控制器
 */
@Tag(name = "流程模板管理")
@RestController
@RequestMapping("/api/workflow/template")
@RequiredArgsConstructor
public class WorkflowTemplateController {

    private final WorkflowTemplateService workflowTemplateService;

    @Operation(summary = "创建流程模板")
    @PostMapping
    public Result<Long> createTemplate(@Valid @RequestBody WorkflowTemplateDTO dto) {
        Long id = workflowTemplateService.createTemplate(dto);
        return Result.success(id);
    }

    @Operation(summary = "更新流程模板")
    @PutMapping("/{id}")
    public Result<Void> updateTemplate(@PathVariable Long id,
                                       @Valid @RequestBody WorkflowTemplateDTO dto) {
        workflowTemplateService.updateTemplate(id, dto);
        return Result.success();
    }

    @Operation(summary = "删除流程模板")
    @DeleteMapping("/{id}")
    public Result<Void> deleteTemplate(@PathVariable Long id) {
        workflowTemplateService.deleteTemplate(id);
        return Result.success();
    }

    @Operation(summary = "发布流程模板")
    @PostMapping("/{id}/publish")
    public Result<Void> publishTemplate(@PathVariable Long id) {
        workflowTemplateService.publishTemplate(id);
        return Result.success();
    }

    @Operation(summary = "获取流程模板详情")
    @GetMapping("/{id}")
    public Result<WorkflowTemplateDetailVO> getTemplateDetail(@PathVariable Long id) {
        WorkflowTemplateDetailVO detail = workflowTemplateService.getTemplateDetail(id);
        return Result.success(detail);
    }

    @Operation(summary = "获取流程模板列表")
    @GetMapping
    public Result<Page<WorkflowTemplateVO>> getTemplates(@Valid WorkflowTemplateQueryDTO query) {
        Page<WorkflowTemplateVO> page = workflowTemplateService.getTemplates(query);
        return Result.success(page);
    }

    @Operation(summary = "保存流程模板配置")
    @PostMapping("/{id}/config")
    public Result<Void> saveTemplateConfig(@PathVariable Long id,
                                            @Valid @RequestBody WorkflowTemplateConfigDTO config) {
        workflowTemplateService.saveTemplateConfig(id, config);
        return Result.success();
    }

    @Operation(summary = "根据模板创建流程定义")
    @PostMapping("/{id}/create-definition")
    public Result<Long> createDefinitionFromTemplate(@PathVariable Long id,
                                                       @RequestBody Map<String, String> params) {
        String workflowName = params.get("workflowName");
        String workflowKey = params.get("workflowKey");

        if (workflowName == null || workflowName.isEmpty()) {
            throw new RuntimeException("流程名称不能为空");
        }

        if (workflowKey == null || workflowKey.isEmpty()) {
            throw new RuntimeException("流程标识不能为空");
        }

        Long definitionId = workflowTemplateService.createDefinitionFromTemplate(id, workflowName, workflowKey);
        return Result.success(definitionId);
    }
}
