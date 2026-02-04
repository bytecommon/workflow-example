package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.SysDept;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 部门Mapper
 */
@Mapper
public interface SysDeptMapper extends BaseMapper<SysDept> {

    /**
     * 根据部门编码查询
     */
    @Select("SELECT * FROM sys_dept WHERE deleted = 0 AND dept_code = #{deptCode}")
    SysDept selectByCode(@Param("deptCode") String deptCode);

    /**
     * 查询部门用户数量
     */
    @Select("SELECT COUNT(*) FROM sys_user WHERE deleted = 0 AND dept_id = #{deptId}")
    Long countUsers(@Param("deptId") Long deptId);
}
