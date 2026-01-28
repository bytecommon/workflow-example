package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.*;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流变量Mapper
 */
@Mapper
interface WorkflowVariableMapper extends BaseMapper<WorkflowVariable> {
}
