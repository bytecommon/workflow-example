package com.example.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.WorkflowFormDTO;
import com.example.workflow.entity.WorkflowForm;
import com.example.workflow.mapper.WorkflowFormMapper;
import com.example.workflow.service.WorkflowFormService;
import com.example.workflow.vo.WorkflowFormVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 表单服务实现
 */
@Service
@RequiredArgsConstructor
class WorkflowFormServiceImpl implements WorkflowFormService {

    private final WorkflowFormMapper workflowFormMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createForm(WorkflowFormDTO dto) {
        // 检查表单标识是否已存在
        Long count = workflowFormMapper.selectCount(
                new LambdaQueryWrapper<WorkflowForm>()
                        .eq(WorkflowForm::getFormKey, dto.getFormKey())
        );

        if (count > 0) {
            throw new RuntimeException("表单标识已存在");
        }

        WorkflowForm form = new WorkflowForm();
        form.setFormKey(dto.getFormKey());
        form.setFormName(dto.getFormName());
        form.setFormDesc(dto.getFormDesc());
        form.setFormConfig(dto.getFormConfig());
        form.setStatus(1);

        workflowFormMapper.insert(form);
        return form.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateForm(Long id, WorkflowFormDTO dto) {
        WorkflowForm form = workflowFormMapper.selectById(id);
        if (form == null) {
            throw new RuntimeException("表单不存在");
        }

        form.setFormName(dto.getFormName());
        form.setFormDesc(dto.getFormDesc());
        form.setFormConfig(dto.getFormConfig());

        workflowFormMapper.updateById(form);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteForm(Long id) {
        WorkflowForm form = workflowFormMapper.selectById(id);
        if (form == null) {
            throw new RuntimeException("表单不存在");
        }

        // 这里可以检查是否有工作流在使用该表单

        workflowFormMapper.deleteById(id);
    }

    @Override
    public WorkflowFormVO getFormDetail(Long id) {
        WorkflowForm form = workflowFormMapper.selectById(id);
        if (form == null) {
            throw new RuntimeException("表单不存在");
        }

        return convertToVO(form);
    }

    @Override
    public Page<WorkflowFormVO> getFormList(Integer pageNum, Integer pageSize, String formName) {
        Page<WorkflowForm> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<WorkflowForm> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(formName)) {
            wrapper.like(WorkflowForm::getFormName, formName);
        }
        wrapper.orderByDesc(WorkflowForm::getCreateTime);

        Page<WorkflowForm> formPage = workflowFormMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<WorkflowFormVO> voPage = new Page<>();
        voPage.setCurrent(formPage.getCurrent());
        voPage.setSize(formPage.getSize());
        voPage.setTotal(formPage.getTotal());

        List<WorkflowFormVO> voList = formPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    private WorkflowFormVO convertToVO(WorkflowForm form) {
        WorkflowFormVO vo = new WorkflowFormVO();
        vo.setId(form.getId());
        vo.setFormKey(form.getFormKey());
        vo.setFormName(form.getFormName());
        vo.setFormDesc(form.getFormDesc());
        vo.setFormConfig(form.getFormConfig());
        vo.setStatus(form.getStatus());
        vo.setCreateTime(form.getCreateTime());
        return vo;
    }
}
