package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流变量实体
 * 用于存储流程实例运行过程中的变量数据，支持流程动态数据传递
 */
@Data
@TableName("workflow_variable")
public class WorkflowVariable {

    /**
     * 变量ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 流程实例ID
     * 关联到workflow_instance表的id字段
     */
    private Long instanceId;

    /**
     * 变量键
     * 变量的唯一标识，用于流程中引用
     */
    private String varKey;

    /**
     * 变量值
     * 变量的实际值，以字符串形式存储
     */
    private String varValue;

    /**
     * 变量类型
     * 变量的数据类型，如STRING、NUMBER、BOOLEAN、DATE等
     */
    private String varType;

    /**
     * 创建时间
     * 变量的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     * 变量的最后更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}