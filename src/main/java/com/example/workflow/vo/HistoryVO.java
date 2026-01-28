package com.example.workflow.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 流程历史VO
 */
@Data
public class HistoryVO {

    /**
     * 历史记录ID
     */
    private Long id;

    /**
     * 节点名称
     */
    private String nodeName;

    /**
     * 操作动作
     * START-发起，APPROVE-同意，REJECT-拒绝，TRANSFER-转交，CANCEL-撤销
     */
    private String action;

    /**
     * 操作人姓名
     */
    private String operatorName;

    /**
     * 操作意见/评论
     */
    private String comment;

    /**
     * 操作时间
     */
    private LocalDateTime operateTime;

    /**
     * 处理耗时（毫秒）
     */
    private Long duration;
}
