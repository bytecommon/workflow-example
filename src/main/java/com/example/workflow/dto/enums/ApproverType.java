package com.example.workflow.dto.enums;

/**
 * 审批人类型枚举
 */
public enum ApproverType {
    USER,       // 指定用户
    ROLE,       // 角色
    DEPT,       // 部门
    LEADER,     // 上级领导
    SELF,       // 发起人自己
    FORM_USER   // 表单字段用户
}
