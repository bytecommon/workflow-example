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
        instanceNo: 'INST_20240115001',
        workflowName: '请假申请流程',
        status: 'RUNNING',
        title: '李四的请假申请',
        startTime: '2024-01-15T09:00:00',
        priority: 0
      },
      {
        id: 2,
        instanceNo: 'INST_20240116001',
        workflowName: '报销申请流程',
        status: 'RUNNING',
        title: '王五的报销申请',
        startTime: '2024-01-16T13:00:00',
        priority: 1
      },
      {
        id: 3,
        instanceNo: 'INST_20240110001',
        workflowName: '采购申请流程',
        status: 'APPROVED',
        title: '赵六的采购申请',
        startTime: '2024-01-10T09:00:00',
        endTime: '2024-01-12T16:00:00',
        priority: 0
      },
      {
        id: 4,
        instanceNo: 'INST_20240108001',
        workflowName: '请假申请流程',
        status: 'TERMINATED',
        title: '钱七的请假申请',
        startTime: '2024-01-08T10:00:00',
        endTime: '2024-01-09T11:00:00',
        priority: 0
      }
    ]
  },

  // 生成任务数据
  generateWorkflowTasks(): WorkflowTask[] {
    return [
      {
        id: 1,
        instanceId: 1,
        instanceNo: 'INST_20240115001',
        workflowName: '请假申请流程',
        nodeName: '部门经理审批',
        status: 'PENDING',
        title: '李四的请假申请',
        startUserName: '李四',
        createTime: '2024-01-15T10:00:00',
        priority: 0
      },
      {
        id: 2,
        instanceId: 2,
        instanceNo: 'INST_20240116001',
        workflowName: '报销申请流程',
        nodeName: '财务审核',
        status: 'PENDING',
        title: '王五的报销申请',
        startUserName: '王五',
        createTime: '2024-01-16T14:30:00',
        priority: 1
      },
      {
        id: 3,
        instanceId: 3,
        instanceNo: 'INST_20240110001',
        workflowName: '采购申请流程',
        nodeName: '采购主管审批',
        status: 'APPROVED',
        title: '赵六的采购申请',
        startUserName: '赵六',
        createTime: '2024-01-10T09:00:00',
        priority: 0
      }
    ]
  },

  // 生成审批历史数据
  generateWorkflowHistory(): WorkflowHistory[] {
    return [
      {
        id: 1,
        nodeName: '开始节点',
        action: 'START',
        operatorName: '赵六',
        comment: '需要采购办公用品',
        operateTime: '2024-01-10T09:00:00',
        duration: 0
      },
      {
        id: 2,
        nodeName: '采购主管审批',
        action: 'APPROVE',
        operatorName: '张三',
        comment: '同意采购申请',
        operateTime: '2024-01-10T11:00:00',
        duration: 7200000
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
  },

  // 获取流程实例详情
  async getInstanceDetail(instanceId: string | number) {
    await this.delay()
    const instances = mockData.generateWorkflowInstances()
    const instance = instances.find(inst =>
      inst.id === instanceId || inst.instanceId === String(instanceId)
    )
    if (!instance) {
      return {
        code: 404,
        message: '流程实例不存在',
        data: null
      }
    }
    return {
      code: 200,
      message: '成功',
      data: {
        instance,
        tasks: mockData.generateWorkflowTasks().filter(task => task.instanceId === instance.instanceId),
        history: mockData.generateWorkflowHistory().filter(h => h.instanceId === instance.instanceId),
        variables: {}
      }
    }
  }
}
