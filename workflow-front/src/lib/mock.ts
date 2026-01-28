import { WorkflowDefinition, WorkflowInstance, WorkflowTask, WorkflowHistory } from './api'

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
        updateTime: '2024-01-01T00:00:00'
      },
      {
        id: 2,
        workflowKey: 'EXPENSE_APPLICATION',
        workflowName: '报销申请流程',
        version: 1,
        workflowDesc: '费用报销审批流程，包含部门经理和财务审核环节',
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
        status: 1,
        createTime: '2024-01-04T00:00:00',
        updateTime: '2024-01-04T00:00:00'
      }
    ]
  },

  // 生成流程实例数据
  generateWorkflowInstances(): WorkflowInstance[] {
    return [
      {
        id: 1,
        instanceId: 'INST_20240115001',
        definitionId: 1,
        definitionName: '请假申请流程',
        currentTaskId: 1,
        status: 1,
        statusText: '运行中',
        startTime: '2024-01-15T09:00:00',
        starterUserId: 'user002',
        starterUserName: '李四'
      },
      {
        id: 2,
        instanceId: 'INST_20240116001',
        definitionId: 2,
        definitionName: '报销申请流程',
        currentTaskId: 2,
        status: 1,
        statusText: '运行中',
        startTime: '2024-01-16T13:00:00',
        starterUserId: 'user003',
        starterUserName: '王五'
      },
      {
        id: 3,
        instanceId: 'INST_20240110001',
        definitionId: 3,
        definitionName: '采购申请流程',
        currentTaskId: 0,
        status: 2,
        statusText: '已完成',
        startTime: '2024-01-10T09:00:00',
        endTime: '2024-01-12T16:00:00',
        starterUserId: 'user004',
        starterUserName: '赵六'
      },
      {
        id: 4,
        instanceId: 'INST_20240108001',
        definitionId: 1,
        definitionName: '请假申请流程',
        currentTaskId: 0,
        status: 3,
        statusText: '已终止',
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
      totalInstances: 156,
      pendingTasks: 12,
      completedInstances: 89,
      runningInstances: 45
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
    const records = mockData.generateWorkflowDefinitions()
    return {
      code: 200,
      message: '成功',
      data: {
        records,
        total: records.length,
        size: 10,
        current: 1,
        pages: 1
      }
    }
  },

  // 获取流程定义详情
  async getWorkflowDetail(id: number) {
    await this.delay()
    const definitions = mockData.generateWorkflowDefinitions()
    const definition = definitions.find(d => d.id === id)
    if (!definition) {
      return {
        code: 404,
        message: '流程定义不存在',
        data: null
      }
    }
    return {
      code: 200,
      message: '成功',
      data: {
        id: definition.id,
        name: definition.workflowName,
        key: definition.workflowKey,
        version: definition.version,
        description: definition.workflowDesc,
        status: definition.status,
        createTime: definition.createTime,
        updateTime: definition.updateTime
      }
    }
  },

  // 获取待办任务列表
  async getPendingTasks() {
    await this.delay()
    const records = mockData.generateWorkflowTasks()
    return {
      code: 200,
      message: '成功',
      data: {
        records,
        total: records.length,
        size: 10,
        current: 1,
        pages: 1
      }
    }
  },

  // 获取我发起的流程实例
  async getMyInstances() {
    await this.delay()
    const records = mockData.generateWorkflowInstances()
    return {
      code: 200,
      message: '成功',
      data: {
        records,
        total: records.length,
        size: 10,
        current: 1,
        pages: 1
      }
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
  }
}
