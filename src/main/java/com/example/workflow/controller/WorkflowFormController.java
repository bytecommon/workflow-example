package com.example.workflow.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.WorkflowFormDTO;
import com.example.workflow.service.WorkflowFormService;
import com.example.workflow.vo.Result;
import com.example.workflow.vo.WorkflowFormVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 工作流表单控制器
 */
@Tag(name = "工作流表单管理")
@RestController
@RequestMapping("/api/form")
@RequiredArgsConstructor
public class WorkflowFormController {

    private final WorkflowFormService workflowFormService;

    @Operation(summary = "创建表单")
    @PostMapping
    public Result<Long> createForm(@Valid @RequestBody WorkflowFormDTO dto) {
        Long id = workflowFormService.createForm(dto);
        return Result.success(id);
    }

    @Operation(summary = "更新表单")
    @PutMapping("/{id}")
    public Result<Void> updateForm(@PathVariable Long id,
                                    @Valid @RequestBody WorkflowFormDTO dto) {
        workflowFormService.updateForm(id, dto);
        return Result.success();
    }

    @Operation(summary = "删除表单")
    @DeleteMapping("/{id}")
    public Result<Void> deleteForm(@PathVariable Long id) {
        workflowFormService.deleteForm(id);
        return Result.success();
    }

    @Operation(summary = "获取表单详情")
    @GetMapping("/{id}")
    public Result<WorkflowFormVO> getFormDetail(@PathVariable Long id) {
        WorkflowFormVO form = workflowFormService.getFormDetail(id);
        return Result.success(form);
    }

    @Operation(summary = "获取表单列表")
    @GetMapping
    public Result<Page<WorkflowFormVO>> getFormList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String formName) {
        Page<WorkflowFormVO> page = workflowFormService.getFormList(pageNum, pageSize, formName);
        return Result.success(page);
    }
}
