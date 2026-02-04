package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户Mapper
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 根据关键词搜索用户
     */
    @Select("SELECT * FROM sys_user WHERE deleted = 0 AND (real_name LIKE CONCAT('%', #{keyword}, '%') OR username LIKE CONCAT('%', #{keyword}, '%'))")
    List<SysUser> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 根据部门ID查询用户
     */
    @Select("SELECT * FROM sys_user WHERE deleted = 0 AND dept_id = #{deptId}")
    List<SysUser> selectByDeptId(@Param("deptId") Long deptId);

    /**
     * 查询部门用户数量
     */
    @Select("SELECT COUNT(*) FROM sys_user WHERE deleted = 0 AND dept_id = #{deptId}")
    Long countByDeptId(@Param("deptId") Long deptId);
}
