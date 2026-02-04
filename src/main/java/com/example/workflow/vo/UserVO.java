package com.example.workflow.vo;

import lombok.Data;

/**
 * 用户VO
 */
@Data
public class UserVO {
    private Long id;
    private String username;
    private String realName;
    private String type;
    private String email;
    private String deptName;
    private String roleName;
}
