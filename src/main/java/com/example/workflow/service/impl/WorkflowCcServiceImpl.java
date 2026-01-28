package com.example.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.entity.WorkflowCc;
import com.example.workflow.entity.WorkflowInstance;
import com.example.workflow.mapper.WorkflowCcMapper;
import com.example.workflow.mapper.WorkflowInstanceMapper;
import com.example.workflow.service.WorkflowCcService;
import com.example.workflow.vo.WorkflowCcVO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 工作流抄送服务实现
 */
@Service
@RequiredArgsConstructor
class WorkflowCcServiceImpl implements WorkflowCcService {

    private final WorkflowCcMapper workflowCcMapper;
    private final WorkflowInstanceMapper workflowInstanceMapper;

    @Override
    public Page<WorkflowCcVO> getMyCc(String userId, Integer pageNum, Integer pageSize) {
        Page<WorkflowCc> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<WorkflowCc> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkflowCc::getCcUserId, userId)
                .orderByDesc(WorkflowCc::getCreateTime);

        Page<WorkflowCc> ccPage = workflowCcMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<WorkflowCcVO> voPage = new Page<>();
        voPage.setCurrent(ccPage.getCurrent());
        voPage.setSize(ccPage.getSize());
        voPage.setTotal(ccPage.getTotal());

        List<WorkflowCcVO> voList = ccPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAsRead(Long id) {
        WorkflowCc cc = workflowCcMapper.selectById(id);
        if (cc == null) {
            throw new RuntimeException("抄送记录不存在");
        }

        cc.setStatus(1); // 已读
        cc.setReadTime(LocalDateTime.now());
        workflowCcMapper.updateById(cc);
    }

    private WorkflowCcVO convertToVO(WorkflowCc cc) {
        WorkflowCcVO vo = new WorkflowCcVO();
        vo.setId(cc.getId());
        vo.setInstanceId(cc.getInstanceId());
        vo.setInstanceNo(cc.getInstanceNo());
        vo.setNodeName(cc.getNodeName());
        vo.setStatus(cc.getStatus());
        vo.setCreateTime(cc.getCreateTime());
        vo.setReadTime(cc.getReadTime());

        // 获取流程实例信息
        WorkflowInstance instance = workflowInstanceMapper.selectById(cc.getInstanceId());
        if (instance != null) {
            vo.setWorkflowName(instance.getWorkflowName());
            vo.setTitle(instance.getTitle());
            vo.setStartUserName(instance.getStartUserName());
        }

        return vo;
    }
}
