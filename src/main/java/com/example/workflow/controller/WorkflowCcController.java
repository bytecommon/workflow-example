package com.example.workflow.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.service.WorkflowCcService;
import com.example.workflow.vo.Result;
import com.example.workflow.vo.WorkflowCcVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 工作流抄送控制器
 */
@Tag(name = "工作流抄送")
@RestController
@RequestMapping("/api/workflow/cc")
@RequiredArgsConstructor
public class WorkflowCcController {

    private final WorkflowCcService workflowCcService;

    @Operation(summary = "获取我的抄送")
    @GetMapping("/my")
    public Result<Page<WorkflowCcVO>> getMyCc(
            @RequestParam String userId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<WorkflowCcVO> page = workflowCcService.getMyCc(userId, pageNum, pageSize);
        return Result.success(page);
    }

    @Operation(summary = "标记为已读")
    @PostMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        workflowCcService.markAsRead(id);
        return Result.success();
    }
}
