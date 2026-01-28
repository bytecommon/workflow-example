package com.example.workflow.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 表单VO
 */
@Data
public class WorkflowFormVO {
    
    /**
     * 表单ID
     */
    private Long id;
    
    /**
     * 表单唯一标识
     */
    private String formKey;
    
    /**
     * 表单名称
     */
    private String formName;
    
    /**
     * 表单描述
     */
    private String formDesc;
    
    /**
     * 表单配置（JSON格式）
     */
    private String formConfig;
    
    /**
     * 状态：0-停用，1-启用
     */
    private Integer status;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
