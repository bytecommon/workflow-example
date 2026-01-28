package com.example.workflow.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工作流抄送VO
 */
@Data
public class WorkflowCcVO {
    
    /**
     * 抄送记录ID
     */
    private Long id;
    
    /**
     * 流程实例ID
     */
    private Long instanceId;
    
    /**
     * 流程实例编号
     */
    private String instanceNo;
    
    /**
     * 工作流名称
     */
    private String workflowName;
    
    /**
     * 节点名称
     */
    private String nodeName;
    
    /**
     * 流程标题
     */
    private String title;
    
    /**
     * 发起人姓名
     */
    private String startUserName;
    
    /**
     * 状态：0-未读，1-已读
     */
    private Integer status;
    
    /**
     * 创建时间（抄送时间）
     */
    private LocalDateTime createTime;
    
    /**
     * 阅读时间
     */
    private LocalDateTime readTime;
}
