package com.example.workflow.dto.enums;

/**
 * 审批模式枚举
 */
public enum ApproveMode {
    AND,        // 会签（所有人都要同意）
    OR,         // 或签（任意一人同意即可）
    SEQUENCE    // 依次审批
}
