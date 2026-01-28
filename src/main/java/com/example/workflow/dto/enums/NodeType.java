package com.example.workflow.dto.enums;

/**
 * 节点类型枚举
 */
public enum NodeType {
    START,      // 开始节点
    APPROVE,    // 审批节点
    CC,         // 抄送节点
    CONDITION,  // 条件节点
    END         // 结束节点
}
