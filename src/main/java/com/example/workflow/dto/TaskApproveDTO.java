package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 任务审批DTO
 */
@Data
public class TaskApproveDTO {

    /**
     * 审批结果
     * true-同意，false-拒绝
     */
    @NotNull(message = "审批结果不能为空")
    private Boolean approved;

    /**
     * 操作人用户ID
     */
    @NotBlank(message = "操作人ID不能为空")
    private String operatorId;

    /**
     * 操作人姓名
     */
    @NotBlank(message = "操作人姓名不能为空")
    private String operatorName;

    /**
     * 审批意见/评论
     * 例如：同意、不同意，理由是...
     */
    private String comment;

    /**
     * 附件（JSON格式）
     * 例如：[{"name":"附件.pdf","url":"http://xxx.com/file.pdf"}]
     */
    private String attachments;

    public Boolean isApproved() {
        return approved;
    }

}
