package com.example.workflow.controller;


import com.example.workflow.entity.SysDept;
import com.example.workflow.entity.SysRole;
import com.example.workflow.entity.SysUser;
import com.example.workflow.mapper.SysDeptMapper;
import com.example.workflow.mapper.SysRoleMapper;
import com.example.workflow.mapper.SysUserMapper;
import com.example.workflow.vo.DepartmentVO;
import com.example.workflow.vo.Result;
import com.example.workflow.vo.RoleVO;
import com.example.workflow.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户管理控制器
 */
@RestController
@RequestMapping("/sys/users")
@Tag(name = "用户管理", description = "用户相关接口")
@RequiredArgsConstructor
public class UserController {

    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;
    private final SysRoleMapper roleMapper;

    @Operation(summary = "获取用户列表")
    @GetMapping
    public Result<List<UserVO>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dept) {
        
        List<SysUser> users;
        if (keyword != null && !keyword.isEmpty()) {
            users = userMapper.searchByKeyword(keyword);
        } else if (dept != null && !dept.isEmpty()) {
            // 根据部门名称查询部门ID
            SysDept deptEntity = deptMapper.selectByCode(dept);
            if (deptEntity != null) {
                users = userMapper.selectByDeptId(deptEntity.getId());
            } else {
                users = userMapper.selectList(null);
            }
        } else {
            users = userMapper.selectList(null);
        }

        List<UserVO> result = users.stream()
                .filter(u -> u.getDeleted() == null || u.getDeleted() == 0)
                .map(this::convertToUserVO)
                .collect(Collectors.toList());

        return Result.success(result);
    }

    @Operation(summary = "获取部门列表")
    @GetMapping("/departments")
    public Result<List<DepartmentVO>> getDepartments() {
        List<SysDept> depts = deptMapper.selectList(null);
        
        List<DepartmentVO> result = depts.stream()
                .filter(d -> d.getDeleted() == null || d.getDeleted() == 0)
                .map(dept -> {
                    DepartmentVO vo = new DepartmentVO();
                    vo.setId(dept.getId());
                    vo.setName(dept.getDeptName());
                    // 查询部门用户数量
                    Long count = userMapper.countByDeptId(dept.getId());
                    vo.setUserCount(count != null ? count.intValue() : 0);
                    return vo;
                })
                .collect(Collectors.toList());

        return Result.success(result);
    }

    @Operation(summary = "获取角色列表")
    @GetMapping("/roles")
    public Result<List<RoleVO>> getRoles() {
        List<SysRole> roles = roleMapper.selectList(null);
        
        List<RoleVO> result = roles.stream()
                .filter(r -> r.getDeleted() == null || r.getDeleted() == 0)
                .map(role -> {
                    RoleVO vo = new RoleVO();
                    vo.setId(role.getId());
                    vo.setCode(role.getRoleCode());
                    vo.setName(role.getRoleName());
                    vo.setDescription(role.getDescription());
                    return vo;
                })
                .collect(Collectors.toList());

        return Result.success(result);
    }

    /**
     * 转换为UserVO
     */
    private UserVO convertToUserVO(SysUser user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setType("user");
        vo.setEmail(user.getEmail());
        
        // 查询部门名称
        if (user.getDeptId() != null) {
            SysDept dept = deptMapper.selectById(user.getDeptId());
            if (dept != null) {
                vo.setDeptName(dept.getDeptName());
            }
        }
        
        // 查询角色名称
        List<SysRole> roles = roleMapper.selectByUserId(user.getId());
        if (!roles.isEmpty()) {
            vo.setRoleName(roles.get(0).getRoleName());
        }
        
        return vo;
    }

}
