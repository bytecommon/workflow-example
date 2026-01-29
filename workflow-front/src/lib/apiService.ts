import { workflowApi, instanceApi, taskApi, ccApi, type Page } from './api'
import { mockApi } from './mock'

// 配置环境变量
const isDevelopment = import.meta.env.DEV
const useMock = isDevelopment && import.meta.env.VITE_USE_MOCK === 'true'

// API服务包装器
export const apiService = {
  // 流程定义相关
  workflow: {
    async getDefinitions(params?: {
      pageNum?: number
      pageSize?: number
      name?: string
      status?: number
    }) {
      if (useMock) {
        return mockApi.getWorkflowDefinitions()
      }
      try {
        const response = await workflowApi.getDefinitions(params)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程定义列表失败:', error)
        return {
          code: 500,
          message: '获取流程定义列表失败',
          data: []
        }
      }
    },

    async getWorkflowDetail(id: number) {
      if (useMock) {
        // 返回模拟的工作流详情数据，包含流程图
        return {
          code: 200,
          message: '成功',
          data: {
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
        }
      }
      try {
        const response = await workflowApi.getWorkflowDetail(id)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取工作流详情失败:', error)
        return {
          code: 500,
          message: '获取工作流详情失败',
          data: null
        }
      }
    },

    async createDefinition(data: any) {
      if (useMock) {
        return mockApi.createWorkflowDefinition(data)
      }
      try {
        const response = await workflowApi.createDefinition(data)
        return {
          code: 200,
          message: '创建成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('创建流程定义失败:', error)
        return {
          code: 500,
          message: '创建流程定义失败',
          data: null
        }
      }
    },

    async publishDefinition(id: number) {
      if (useMock) {
        return mockApi.publishWorkflowDefinition(id)
      }
      try {
        const response = await workflowApi.publishWorkflow(id)
        return {
          code: 200,
          message: '发布成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('发布流程定义失败:', error)
        return {
          code: 500,
          message: '发布流程定义失败',
          data: false
        }
      }
    },

    async deleteDefinition(id: number) {
      if (useMock) {
        return {
          code: 200,
          message: '删除成功',
          data: true
        }
      }
      try {
        const response = await workflowApi.deleteDefinition(id)
        return {
          code: 200,
          message: '删除成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('删除流程定义失败:', error)
        return {
          code: 500,
          message: '删除流程定义失败',
          data: false
        }
      }
    }
  },

  // 任务相关
  task: {
    async getPendingTasks(params: {
      userId: string
      pageNum?: number
      pageSize?: number
      definitionName?: string
      nodeName?: string
    }) {
      if (useMock) {
        return mockApi.getPendingTasks()
      }
      try {
        const response = await taskApi.getPendingTasks(params)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取待办任务失败:', error)
        return {
          code: 500,
          message: '获取待办任务失败',
          data: []
        }
      }
    },

    async approveTask(taskId: number, data: {
      userId: string
      comment?: string
      action: string
    }) {
      if (useMock) {
        return mockApi.approveTask(taskId, data)
      }
      try {
        const response = await taskApi.approveTask(taskId, data)
        return {
          code: 200,
          message: '审批成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('审批任务失败:', error)
        return {
          code: 500,
          message: '审批任务失败',
          data: false
        }
      }
    },

    async transferTask(taskId: number, data: {
      userId: string
      targetUserId: string
      comment?: string
    }) {
      if (useMock) {
        return mockApi.transferTask(taskId, data)
      }
      try {
        const response = await taskApi.transferTask(taskId, data)
        return {
          code: 200,
          message: '转办成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('转办任务失败:', error)
        return {
          code: 500,
          message: '转办任务失败',
          data: false
        }
      }
    }
  },

  // 实例相关
  instance: {
    async getMyInstances(params: {
      userId: string
      pageNum?: number
      pageSize?: number
      definitionName?: string
      status?: number
    }) {
      if (useMock) {
        return mockApi.getMyInstances()
      }
      try {
        const response = await instanceApi.getMyInstances(params)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程实例失败:', error)
        return {
          code: 500,
          message: '获取流程实例失败',
          data: []
        }
      }
    },

    async getInstanceDetail(instanceId: number) {
      if (useMock) {
        // 返回模拟的实例详情
        return {
          code: 200,
          message: '成功',
          data: {
            instance: {
              id: instanceId,
              instanceId: `INST_${instanceId}`,
              definitionId: 1,
              definitionName: '请假申请流程',
              currentTaskId: 1,
              status: 1,
              statusText: '运行中',
              startTime: '2024-01-15T09:00:00',
              starterUserId: 'user001',
              starterUserName: '张三'
            },
            tasks: [],
            history: [],
            variables: {}
          }
        }
      }
      try {
        const response = await instanceApi.getInstanceDetail(instanceId)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程实例详情失败:', error)
        return {
          code: 500,
          message: '获取流程实例详情失败',
          data: null
        }
      }
    },

    async cancelInstance(id: number, reason: string) {
      if (useMock) {
        return {
          code: 200,
          message: '终止成功',
          data: true
        }
      }
      try {
        const response = await instanceApi.cancelInstance(id, reason)
        return {
          code: 200,
          message: '终止成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('终止流程实例失败:', error)
        return {
          code: 500,
          message: '终止流程实例失败',
          data: false
        }
      }
    }
  },

  // 抄送相关
  cc: {
    async getMyCc(params: {
      userId: string
      pageNum?: number
      pageSize?: number
    }) {
      if (useMock) {
        // 返回模拟的抄送数据
        return {
          code: 200,
          message: '成功',
          data: {
            records: [
              {
                id: 1,
                instanceId: 'INST_001',
                definitionName: '请假申请流程',
                nodeName: '部门经理审批',
                senderName: '张三',
                createTime: '2024-01-15T10:00:00',
                read: false
              }
            ],
            total: 1,
            size: 10,
            current: 1,
            pages: 1
          }
        }
      }
      try {
        const response = await ccApi.getMyCc(params)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取我的抄送失败:', error)
        return {
          code: 500,
          message: '获取我的抄送失败',
          data: {
            records: [],
            total: 0,
            size: 10,
            current: 1,
            pages: 0
          }
        }
      }
    },

    async markAsRead(id: number) {
      if (useMock) {
        return {
          code: 200,
          message: '标记成功',
          data: true
        }
      }
      try {
        const response = await ccApi.markAsRead(id)
        return {
          code: 200,
          message: '标记成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('标记抄送为已读失败:', error)
        return {
          code: 500,
          message: '标记抄送为已读失败',
          data: false
        }
      }
    }
  },



  // 用户相关
  user: {
    async getUsers(params?: any) {
      if (useMock) {
        return mockApi.getUsers()
      }
      try {
        // 使用现有的API来获取用户数据，这里暂时返回空数组
        return {
          code: 200,
          message: '成功',
          data: []
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        return {
          code: 500,
          message: '获取用户列表失败',
          data: []
        }
      }
    },

    async getCurrentUser() {
      if (useMock) {
        return mockApi.getCurrentUser()
      }
      try {
        // 使用现有的API来获取当前用户信息，这里暂时返回默认用户
        return {
          code: 200,
          message: '成功',
          data: {
            id: 'user001',
            name: '当前用户',
            department: '技术部'
          }
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error)
        return {
          code: 500,
          message: '获取当前用户信息失败',
          data: null
        }
      }
    }
  },

  // 统计相关 - 使用现有API计算统计数据
  statistics: {
    async getStatistics(userId: string) {
      if (useMock) {
        return mockApi.getStatistics()
      }
      try {
        // 使用现有的任务和实例API来获取统计数据
        const [pendingTasksResponse, myInstancesResponse] = await Promise.all([
          taskApi.getPendingTasks({ userId, pageSize: 1 }),
          instanceApi.getMyInstances({ userId, pageSize: 1 })
        ])

        const pendingTasks = pendingTasksResponse.data.data
        const myInstances = myInstancesResponse.data.data

        return {
          code: 200,
          message: '成功',
          data: {
            totalInstances: myInstances.total || 0,
            pendingTasks: pendingTasks.total || 0,
            completedInstances: myInstances.records?.filter((instance: any) => instance.status === 2).length || 0,
            runningInstances: myInstances.records?.filter((instance: any) => instance.status === 1).length || 0,
            myPendingTasks: pendingTasks.total || 0
          }
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        return {
          code: 500,
          message: '获取统计数据失败',
          data: {
            totalInstances: 0,
            pendingTasks: 0,
            completedInstances: 0,
            runningInstances: 0,
            myPendingTasks: 0
          }
        }
      }
    }
  }
}

// 环境配置
export const config = {
  isDevelopment,
  useMock,
  apiBaseUrl: useMock ? '/api' : '/api'
}