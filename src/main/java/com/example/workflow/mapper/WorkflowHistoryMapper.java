package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流历史Mapper
 */
@Mapper
public interface WorkflowHistoryMapper extends BaseMapper<WorkflowHistory> {
}
