import { workflowApi, instanceApi, taskApi, ccApi, type Page, type WorkflowDefinition, type WorkflowInstance, type WorkflowTask, type WorkflowCcVO } from './api'
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
      workflowName?: string
      status?: number
      category?: string
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
          data: { records: [] as WorkflowDefinition[], total: 0, size: 10, current: 1, pages: 0 } as Page<WorkflowDefinition>
        }
      }
    },

    async getWorkflowDetail(id: number) {
      if (useMock) {
        return mockApi.getWorkflowDetail(id)
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

    async updateDefinition(id: number, data: any) {
      if (useMock) {
        return { code: 200, message: '更新成功', data: null }
      }
      try {
        const response = await workflowApi.updateDefinition(id, data)
        return {
          code: 200,
          message: '更新成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('更新流程定义失败:', error)
        return {
          code: 500,
          message: '更新流程定义失败',
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
    },

    async saveConfig(id: number, config: any) {
      if (useMock) {
        return { code: 200, message: '保存成功', data: null }
      }
      try {
        const response = await workflowApi.saveConfig(id, config)
        return {
          code: 200,
          message: '保存成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('保存配置失败:', error)
        return {
          code: 500,
          message: '保存配置失败',
          data: null
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
          data: { records: [] as WorkflowTask[], total: 0, size: 10, current: 1, pages: 0 } as Page<WorkflowTask>
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
          data: { records: [] as WorkflowInstance[], total: 0, size: 10, current: 1, pages: 0 } as Page<WorkflowInstance>
        }
      }
    },

    async getInstanceDetail(instanceId: number) {
      if (useMock) {
        return {
          code: 200,
          message: '成功',
          data: {
            instance: {
              id: instanceId,
              instanceNo: `INST_${instanceId}`,
              workflowName: '请假申请流程',
              status: 'RUNNING',
              title: '请假申请',
              startTime: '2024-01-15T09:00:00',
              priority: 0
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
        return mockApi.getMyCc()
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
            records: [] as WorkflowCcVO[],
            total: 0,
            size: 10,
            current: 1,
            pages: 0
          } as Page<WorkflowCcVO>
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
    async getUsers() {
      if (useMock) {
        return mockApi.getUsers()
      }
      try {
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
        return {
          code: 200,
          message: '成功',
          data: {
            id: 'user001',
            name: '当前用户',
            email: 'user@example.com'
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

  // 统计相关
  statistics: {
    async getStatistics(userId: string) {
      if (useMock) {
        return mockApi.getStatistics()
      }
      try {
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
            completedInstances: 0, // 需后端支持更多过滤
            runningInstances: 0,
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
  apiBaseUrl: '/api'
}
