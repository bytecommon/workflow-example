package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 启动工作流DTO
 */
@Data
public class WorkflowStartDTO {

    /**
     * 工作流定义ID
     */
    @NotNull(message = "工作流ID不能为空")
    private Long workflowId;

    /**
     * 发起人用户ID
     */
    @NotBlank(message = "发起人ID不能为空")
    private String startUserId;

    /**
     * 发起人姓名
     */
    @NotBlank(message = "发起人姓名不能为空")
    private String startUserName;

    /**
     * 流程标题
     * 例如：张三的请假申请、2024年第一季度预算申请
     */
    @NotBlank(message = "流程标题不能为空")
    private String title;

    /**
     * 表单数据（JSON格式）
     * 例如：{"leaveType":"事假","days":3,"reason":"家里有事"}
     */
    private String formData;

    /**
     * 业务键，用于关联外部业务系统
     * 例如：LEAVE-2024-001
     */
    private String businessKey;

    /**
     * 优先级
     * 0-普通，1-紧急，2-特急
     */
    private Integer priority = 0;
}