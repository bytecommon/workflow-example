package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 任务转交DTO
 */
@Data
public class TaskTransferDTO {

    /**
     * 操作人用户ID（转交人）
     */
    @NotBlank(message = "操作人ID不能为空")
    private String operatorId;

    /**
     * 操作人姓名（转交人）
     */
    @NotBlank(message = "操作人姓名不能为空")
    private String operatorName;

    /**
     * 目标用户ID（接收人）
     */
    @NotBlank(message = "目标用户ID不能为空")
    private String targetUserId;

    /**
     * 目标用户姓名（接收人）
     */
    @NotBlank(message = "目标用户姓名不能为空")
    private String targetUserName;

    /**
     * 转交原因
     * 例如：我不在，请帮忙处理
     */
    private String reason;
}
