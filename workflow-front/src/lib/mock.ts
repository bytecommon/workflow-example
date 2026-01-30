import { WorkflowDefinition, WorkflowInstance, WorkflowTask, WorkflowHistory, FormDefinition } from './api'

// Mock数据生成器
export const mockData = {
  // 生成流程定义数据
  generateWorkflowDefinitions(): WorkflowDefinition[] {
    return [
      {
        id: 1,
        workflowKey: 'LEAVE_APPLICATION',
        workflowName: '请假申请流程',
        version: 1,
        workflowDesc: '员工请假申请审批流程，包含部门经理和人事审批环节',
        status: 1,
        createTime: '2024-01-01T00:00:00',
        updateTime: '2024-01-01T00:00:00',
        createBy: 'admin',
        updateBy: 'admin'
      },
      {
        id: 2,
        workflowKey: 'EXPENSE_APPLICATION',
        workflowName: '报销申请流程',
        version: 1,
        workflowDesc: '费用报销审批流程，包含部门经理和财务审核环节',
        status: 1,
        createTime: '2024-01-02T00:00:00',
        updateTime: '2024-01-02T00:00:00',
        createBy: 'admin',
        updateBy: 'admin'
      },
      {
        id: 3,
        workflowKey: 'PURCHASE_APPLICATION',
        workflowName: '采购申请流程',
        version: 1,
        workflowDesc: '物品采购审批流程，包含采购主管和财务审批环节',
        status: 0,
        createTime: '2024-01-03T00:00:00',
        updateTime: '2024-01-03T00:00:00',
        createBy: 'admin',
        updateBy: 'admin'
      },
      {
        id: 4,
        workflowKey: 'SEAL_APPLICATION',
        workflowName: '用印申请流程',
        version: 1,
        workflowDesc: '公司用印申请审批流程',
        status: 1,
        createTime: '2024-01-04T00:00:00',
        updateTime: '2024-01-04T00:00:00',
        createBy: 'admin',
        updateBy: 'admin'
      }
    ]
  },

  // 生成流程实例数据
  generateWorkflowInstances(): WorkflowInstance[] {
    return [
      {
        id: 1,
        instanceNo: 'INST_20240115001',
        definitionId: 1,
        definitionName: '请假申请流程',
        definitionKey: 'LEAVE_APPLICATION',
        workflowName: '请假申请流程',
        title: '张三的请假申请',
        status: 1,
        statusText: '运行中',
        priority: 0,
        startTime: '2024-01-15T09:00:00',
        starterUserId: 'user002',
        starterUserName: '李四'
      },
      {
        id: 2,
        instanceNo: 'INST_20240116001',
        definitionId: 2,
        definitionName: '报销申请流程',
        definitionKey: 'EXPENSE_APPLICATION',
        workflowName: '报销申请流程',
        title: '王五的报销申请',
        status: 1,
        statusText: '运行中',
        priority: 1,
        startTime: '2024-01-16T13:00:00',
        starterUserId: 'user003',
        starterUserName: '王五'
      },
      {
        id: 3,
        instanceNo: 'INST_20240110001',
        definitionId: 3,
        definitionName: '采购申请流程',
        definitionKey: 'PURCHASE_APPLICATION',
        workflowName: '采购申请流程',
        title: '赵六的采购申请',
        status: 2,
        statusText: '已完成',
        priority: 0,
        startTime: '2024-01-10T09:00:00',
        endTime: '2024-01-12T16:00:00',
        starterUserId: 'user004',
        starterUserName: '赵六'
      },
      {
        id: 4,
        instanceNo: 'INST_20240108001',
        definitionId: 1,
        definitionName: '请假申请流程',
        definitionKey: 'LEAVE_APPLICATION',
        workflowName: '请假申请流程',
        title: '钱七的请假申请',
        status: 3,
        statusText: '已终止',
        priority: 0,
        startTime: '2024-01-08T10:00:00',
        endTime: '2024-01-09T11:00:00',
        starterUserId: 'user005',
        starterUserName: '钱七'
      }
    ]
  },

  // 生成任务数据
  generateWorkflowTasks(): WorkflowTask[] {
    return [
      {
        id: 1,
        taskId: 'TASK_20240115001',
        instanceId: 'INST_20240115001',
        definitionId: 1,
        definitionName: '请假申请流程',
        nodeId: 'NODE_DEPT_MANAGER',
        nodeName: '部门经理审批',
        assigneeId: 'user001',
        assigneeName: '张三',
        status: 10,
        statusText: '待处理',
        createTime: '2024-01-15T10:00:00',
        dueTime: '2024-01-18T10:00:00'
      },
      {
        id: 2,
        taskId: 'TASK_20240116001',
        instanceId: 'INST_20240116001',
        definitionId: 2,
        definitionName: '报销申请流程',
        nodeId: 'NODE_FINANCE_REVIEW',
        nodeName: '财务审核',
        assigneeId: 'user001',
        assigneeName: '张三',
        status: 10,
        statusText: '待处理',
        createTime: '2024-01-16T14:30:00',
        dueTime: '2024-01-19T14:30:00'
      },
      {
        id: 3,
        taskId: 'TASK_20240110001',
        instanceId: 'INST_20240110001',
        definitionId: 3,
        definitionName: '采购申请流程',
        nodeId: 'NODE_PURCHASE_MANAGER',
        nodeName: '采购主管审批',
        assigneeId: 'user001',
        assigneeName: '张三',
        status: 11,
        statusText: '已处理',
        createTime: '2024-01-10T09:00:00',
        claimTime: '2024-01-10T10:00:00',
        finishTime: '2024-01-10T11:00:00'
      }
    ]
  },

  // 生成审批历史数据
  generateWorkflowHistory(): WorkflowHistory[] {
    return [
      {
        id: 1,
        instanceId: 'INST_20240110001',
        taskId: 'TASK_20240110001',
        nodeId: 'NODE_START',
        nodeName: '开始节点',
        action: 'start',
        actionText: '发起流程',
        operatorId: 'user004',
        operatorName: '赵六',
        comment: '需要采购办公用品',
        createTime: '2024-01-10T09:00:00'
      },
      {
        id: 2,
        instanceId: 'INST_20240110001',
        taskId: 'TASK_20240110001',
        nodeId: 'NODE_PURCHASE_MANAGER',
        nodeName: '采购主管审批',
        action: 'approve',
        actionText: '审批通过',
        operatorId: 'user001',
        operatorName: '张三',
        comment: '同意采购申请',
        createTime: '2024-01-10T11:00:00'
      }
    ]
  },

  // 生成统计信息
  generateStatistics() {
    return {
      totalInstances: 4,
      pendingTasks: 5,
      completedInstances: 1,
      runningInstances: 2,
      myPendingTasks: 3
    }
  },

  // 生成表单定义数据
  generateFormDefinitions(): Record<number, FormDefinition> {
    return {
      1: {
        id: 1,
        formName: '请假申请表',
        formKey: 'leave_form',
        formDesc: '员工请假申请表单',
        formConfig: JSON.stringify({
          fields: [
            {
              name: 'leaveType',
              label: '请假类型',
              type: 'select',
              required: true,
              options: ['年假', '病假', '事假', '调休']  // 字符串数组格式
            },
            {
              name: 'days',
              label: '请假天数',
              type: 'number',
              required: true
            },
            {
              name: 'startDate',
              label: '开始日期',
              type: 'date',
              required: true
            },
            {
              name: 'endDate',
              label: '结束日期',
              type: 'date',
              required: true
            },
            {
              name: 'reason',
              label: '请假原因',
              type: 'textarea',
              required: true
            }
          ]
        }),
        status: 1,
        createTime: '2026-01-30T09:08:45',
        updateTime: '2026-01-30T09:08:45'
      },
      2: {
        id: 2,
        formName: '报销申请表',
        formKey: 'expense_form',
        formDesc: '费用报销申请表单',
        formConfig: JSON.stringify({
          fields: [
            {
              name: 'expenseType',
              label: '费用类型',
              type: 'select',
              required: true,
              options: ['差旅费', '办公费', '培训费', '招待费', '其他']
            },
            {
              name: 'amount',
              label: '报销金额',
              type: 'number',
              required: true
            },
            {
              name: 'expenseDate',
              label: '费用发生日期',
              type: 'date',
              required: true
            },
            {
              name: 'description',
              label: '费用说明',
              type: 'textarea',
              required: true
            },
            {
              name: 'hasInvoice',
              label: '是否有发票',
              type: 'checkbox',
              defaultValue: false,
              required: false
            }
          ]
        }),
        status: 1,
        createTime: '2024-01-02T00:00:00',
        updateTime: '2024-01-02T00:00:00'
      }
    }
  }
}

// Mock API服务
export const mockApi = {
  // 模拟网络延迟
  delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 获取流程定义列表
  async getWorkflowDefinitions() {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: mockData.generateWorkflowDefinitions()
    }
  },

  // 获取待办任务列表
  async getPendingTasks() {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: mockData.generateWorkflowTasks()
    }
  },

  // 获取我发起的流程实例
  async getMyInstances() {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: mockData.generateWorkflowInstances()
    }
  },

  // 获取统计信息
  async getStatistics() {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: {
        ...mockData.generateStatistics(),
        myPendingTasks: 5
      }
    }
  },

  // 获取已完成任务
  async getCompletedTasks() {
    await this.delay()
    const tasks = mockData.generateWorkflowTasks().filter(task => task.status === 11)
    return {
      code: 200,
      message: '成功',
      data: tasks
    }
  },

  // 获取用户列表
  async getUsers() {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: [
        { id: 'user001', name: '张三', email: 'zhangsan@example.com' },
        { id: 'user002', name: '李四', email: 'lisi@example.com' },
        { id: 'user003', name: '王五', email: 'wangwu@example.com' },
        { id: 'user004', name: '赵六', email: 'zhaoliu@example.com' },
        { id: 'user005', name: '钱七', email: 'qianqi@example.com' }
      ]
    }
  },

  // 获取当前用户信息
  async getCurrentUser() {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: {
        id: 'user001',
        name: '张三',
        email: 'zhangsan@example.com'
      }
    }
  },

  // 审批任务
  async approveTask(taskId: number, data: any) {
    await this.delay()
    return {
      code: 200,
      message: '审批成功',
      data: true
    }
  },

  // 转办任务
  async transferTask(taskId: number, data: any) {
    await this.delay()
    return {
      code: 200,
      message: '转办成功',
      data: true
    }
  },

  // 发布流程定义
  async publishWorkflowDefinition(id: number) {
    await this.delay()
    return {
      code: 200,
      message: '发布成功',
      data: true
    }
  },

  // 创建流程定义
  async createWorkflowDefinition(data: any) {
    await this.delay()
    return {
      code: 200,
      message: '创建成功',
      data: Math.floor(Math.random() * 1000) + 100
    }
  },

  // 获取表单详情
  async getFormDetail(formId: number) {
    await this.delay()
    const forms = mockData.generateFormDefinitions()
    const form = forms[formId]
    if (!form) {
      return {
        code: 404,
        message: '表单不存在',
        data: null
      }
    }
    return {
      code: 200,
      message: '成功',
      data: form
    }
  }
}