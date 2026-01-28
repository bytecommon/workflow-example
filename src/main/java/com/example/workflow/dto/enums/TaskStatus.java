package com.example.workflow.dto.enums;

/**
 * 任务状态枚举
 */
public enum TaskStatus {
    PENDING,      // 待处理
    APPROVED,     // 已同意
    REJECTED,     // 已拒绝
    TRANSFERRED,  // 已转交
    CANCELED      // 已取消
}
