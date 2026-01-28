package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工作流定义实体
 * 用于定义工作流的基本信息，包括工作流标识、名称、版本、状态等
 */
@Data
@TableName("workflow_definition")
public class WorkflowDefinition {
    
    /**
     * 工作流ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 工作流唯一标识
     * 用于区分不同的工作流，如：leave_approval、purchase_approval
     */
    private String workflowKey;
    
    /**
     * 工作流名称
     * 工作流的显示名称，如：请假审批、采购审批
     */
    private String workflowName;
    
    /**
     * 工作流描述
     * 对工作流的详细说明
     */
    private String workflowDesc;
    
    /**
     * 工作流分类
     * 例如：人事管理、财务管理、行政管理
     */
    private String category;
    
    /**
     * 版本号
     * 工作流的版本，从1开始递增
     */
    private Integer version;
    
    /**
     * 状态
     * 0-停用，1-启用
     */
    private Integer status;
    
    /**
     * 关联表单ID
     * 关联到workflow_form表的id字段
     */
    private Long formId;
    
    /**
     * 工作流图标
     * 用于前端展示的工作流图标
     */
    private String icon;
    
    /**
     * 排序序号
     * 工作流在列表中的显示顺序
     */
    private Integer sortOrder;
    
    /**
     * 创建人
     * 创建工作流的用户
     */
    private String createBy;
    
    /**
     * 创建时间
     * 工作流的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 更新人
     * 最后更新工作流的用户
     */
    private String updateBy;
    
    /**
     * 更新时间
     * 工作流的最后更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 删除标记
     * 逻辑删除标记，0-未删除，1-已删除
     */
    @TableLogic
    private Integer deleted;
}
