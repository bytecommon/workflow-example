import { WorkflowDefinition, WorkflowInstance, WorkflowTask, WorkflowHistory, Page, WorkflowDetailVO, WorkflowCcVO } from './api'

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
        category: '人事',
        status: 1,
        createTime: '2024-01-01T00:00:00',
        updateTime: '2024-01-01T00:00:00'
      },
      {
        id: 2,
        workflowKey: 'EXPENSE_APPLICATION',
        workflowName: '报销申请流程',
        version: 1,
        workflowDesc: '费用报销审批流程，包含部门经理和财务审核环节',
        category: '财务',
        status: 1,
        createTime: '2024-01-02T00:00:00',
        updateTime: '2024-01-02T00:00:00'
      },
      {
        id: 3,
        workflowKey: 'PURCHASE_APPLICATION',
        workflowName: '采购申请流程',
        version: 1,
        workflowDesc: '物品采购审批流程，包含采购主管和财务审批环节',
        category: '采购',
        status: 0,
        createTime: '2024-01-03T00:00:00',
        updateTime: '2024-01-03T00:00:00'
      },
      {
        id: 4,
        workflowKey: 'SEAL_APPLICATION',
        workflowName: '用印申请流程',
        version: 1,
        workflowDesc: '公司用印申请审批流程',
        category: '行政',
        status: 1,
        createTime: '2024-01-04T00:00:00',
        updateTime: '2024-01-04T00:00:00'
      }
    ]
  },

  // 生成流程实例数据 - 修复字段不匹配问题
  generateWorkflowInstances(): WorkflowInstance[] {
    return [
      {
        id: 1,
        instanceNo: 'INST_20240115001',
        workflowName: '请假申请流程',
        status: 'RUNNING',
        title: '2024年1月15日请假申请',
        startTime: '2024-01-15T09:00:00',
        priority: 0
      },
      {
        id: 2,
        instanceNo: 'INST_20240116001',
        workflowName: '报销申请流程',
        status: 'RUNNING',
        title: '2024年1月16日报销申请',
        startTime: '2024-01-16T13:00:00',
        priority: 1
      },
      {
        id: 3,
        instanceNo: 'INST_20240110001',
        workflowName: '采购申请流程',
        status: 'APPROVED',
        title: '2024年1月10日采购申请',
        startTime: '2024-01-10T09:00:00',
        endTime: '2024-01-12T16:00:00',
        priority: 0
      },
      {
        id: 4,
        instanceNo: 'INST_20240108001',
        workflowName: '请假申请流程',
        status: 'TERMINATED',
        title: '2024年1月8日请假申请',
        startTime: '2024-01-08T10:00:00',
        endTime: '2024-01-09T11:00:00',
        priority: 2
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
        status: 0,
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
        status: 0,
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
        status: 1,
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

  // 生成工作流详情数据
  generateWorkflowDetail(id: number): WorkflowDetailVO {
    return {
      id,
      name: '请假申请流程',
      key: 'leave_apply',
      version: 1,
      description: '员工请假审批流程',
      status: 1,
      createTime: '2024-01-01T00:00:00',
      updateTime: '2024-01-01T00:00:00',
      nodes: [
        { id: 'start', name: '开始', type: 'start', x: 50, y: 200, status: 'pending' },
        { id: 'apply', name: '提交申请', type: 'task', x: 200, y: 200, status: 'pending' },
        { id: 'dept_approve', name: '部门审批', type: 'approval', x: 370, y: 130, assignees: ['部门经理'], status: 'pending' },
        { id: 'hr_approve', name: 'HR审批', type: 'approval', x: 370, y: 270, assignees: ['HR经理'], status: 'pending' },
        { id: 'final_approve', name: '最终审批', type: 'approval', x: 540, y: 200, assignees: ['总经理'], status: 'pending' },
        { id: 'end', name: '结束', type: 'end', x: 710, y: 200, status: 'pending' }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'apply' },
        { id: 'e2', source: 'apply', target: 'dept_approve' },
        { id: 'e3', source: 'apply', target: 'hr_approve' },
        { id: 'e4', source: 'dept_approve', target: 'final_approve' },
        { id: 'e5', source: 'hr_approve', target: 'final_approve' },
        { id: 'e6', source: 'final_approve', target: 'end' }
      ]
    }
  },

  // 生成抄送数据
  generateWorkflowCc(): WorkflowCcVO[] {
    return [
      {
        id: 1,
        instanceId: 1,
        instanceNo: 'INST_20240115001',
        workflowName: '请假申请流程',
        nodeName: '部门经理审批',
        title: '2024年1月15日请假申请',
        startUserName: '李四',
        status: 0,
        createTime: '2024-01-15T10:00:00'
      },
      {
        id: 2,
        instanceId: 2,
        instanceNo: 'INST_20240116001',
        workflowName: '报销申请流程',
        nodeName: '财务审核',
        title: '2024年1月16日报销申请',
        startUserName: '王五',
        status: 1,
        createTime: '2024-01-16T14:30:00',
        readTime: '2024-01-16T15:00:00'
      }
    ]
  },

  // 生成统计信息
  generateStatistics() {
    return {
      totalInstances: 156,
      pendingTasks: 12,
      completedInstances: 89,
      runningInstances: 45
    }
  },

  // 分页包装函数 - 关键修复
  wrapPage<T>(data: T[], pageNum: number = 1, pageSize: number = 10): Page<T> {
    return {
      records: data.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      total: data.length,
      size: pageSize,
      current: pageNum,
      pages: Math.ceil(data.length / pageSize)
    }
  }
}

// Mock API服务
export const mockApi = {
  // 模拟网络延迟
  delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 获取流程定义列表 - 修复分页包装
  async getWorkflowDefinitions() {
    await this.delay()
    const definitions = mockData.generateWorkflowDefinitions()
    return {
      code: 200,
      message: '成功',
      data: mockData.wrapPage(definitions, 1, 10)
    }
  },

  // 获取待办任务列表 - 修复分页包装
  async getPendingTasks() {
    await this.delay()
    const tasks = mockData.generateWorkflowTasks()
    return {
      code: 200,
      message: '成功',
      data: mockData.wrapPage(tasks, 1, 10)
    }
  },

  // 获取我发起的流程实例 - 修复分页包装
  async getMyInstances() {
    await this.delay()
    const instances = mockData.generateWorkflowInstances()
    return {
      code: 200,
      message: '成功',
      data: mockData.wrapPage(instances, 1, 10)
    }
  },

  // 获取工作流详情
  async getWorkflowDetail(id: number) {
    await this.delay()
    return {
      code: 200,
      message: '成功',
      data: mockData.generateWorkflowDetail(id)
    }
  },

  // 获取抄送列表 - 修复分页包装
  async getMyCc() {
    await this.delay()
    const cc = mockData.generateWorkflowCc()
    return {
      code: 200,
      message: '成功',
      data: mockData.wrapPage(cc, 1, 10)
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
    const tasks = mockData.generateWorkflowTasks().filter(task => task.status === 1)
    return {
      code: 200,
      message: '成功',
      data: mockData.wrapPage(tasks, 1, 10)
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
  async approveTask(_taskId: number, _data: any) {
    await this.delay()
    return {
      code: 200,
      message: '审批成功',
      data: true
    }
  },

  // 转办任务
  async transferTask(_taskId: number, _data: any) {
    await this.delay()
    return {
      code: 200,
      message: '转办成功',
      data: true
    }
  },

  // 发布流程定义
  async publishWorkflowDefinition(_id: number) {
    await this.delay()
    return {
      code: 200,
      message: '发布成功',
      data: true
    }
  },

  // 创建流程定义
  async createWorkflowDefinition(_data: any) {
    await this.delay()
    return {
      code: 200,
      message: '创建成功',
      data: Math.floor(Math.random() * 1000) + 100
    }
  }
}
