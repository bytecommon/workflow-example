package com.example.workflow.dto.enums;

/**
 * 流程实例状态枚举
 */
public enum InstanceStatus {
    RUNNING,    // 运行中
    APPROVED,   // 已通过
    REJECTED,   // 已拒绝
    CANCELED,   // 已取消
    TERMINATED  // 已终止
}
