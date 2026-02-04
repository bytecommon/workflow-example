package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 角色Mapper
 */
@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    /**
     * 根据角色编码查询
     */
    @Select("SELECT * FROM sys_role WHERE deleted = 0 AND role_code = #{roleCode}")
    SysRole selectByCode(@Param("roleCode") String roleCode);

    /**
     * 根据用户ID查询角色列表
     */
    @Select("SELECT r.* FROM sys_role r INNER JOIN sys_user_role ur ON r.id = ur.role_id WHERE r.deleted = 0 AND ur.user_id = #{userId}")
    List<SysRole> selectByUserId(@Param("userId") Long userId);
}
