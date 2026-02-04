import { workflowApi, templateApi, instanceApi, taskApi, ccApi, formApi, userApi, type Page, type WorkflowDefinition, type WorkflowTemplate, type WorkflowInstance, type WorkflowTask, type WorkflowCcVO } from './api'
import { mockApi } from './mock'

// 1. 基础配置与辅助函数
const isDevelopment = import.meta.env.DEV
const useMock = isDevelopment && import.meta.env.VITE_USE_MOCK === 'true'

const emptyPage = <T>(records: T[] = []): Page<T> => ({
  records,
  total: 0,
  size: 10,
  current: 1,
  pages: 0
})

// 2. 核心模块定义 (直接导出以规避对象挂载失败风险)
export const workflowService = {
  async getDefinitions(params?: any) {
    if (useMock) return mockApi.getWorkflowDefinitions()
    try {
      const response = await workflowApi.getDefinitions(params)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: emptyPage<WorkflowDefinition>() }
    }
  },
  async getWorkflowDetail(id: number) {
    if (useMock) return mockApi.getWorkflowDetail(id)
    try {
      const response = await workflowApi.getWorkflowDetail(id)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取详情失败', data: null }
    }
  },
  async createDefinition(data: any) {
    if (useMock) return mockApi.createWorkflowDefinition(data)
    try {
      const response = await workflowApi.createDefinition(data)
      return { code: 200, message: '创建成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '创建失败', data: null }
    }
  },
  async updateDefinition(id: number, data: any) {
    if (useMock) return { code: 200, message: '更新成功', data: null }
    try {
      const response = await workflowApi.updateDefinition(id, data)
      return { code: 200, message: '更新成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '更新失败', data: null }
    }
  },
  async publishDefinition(id: number) {
    if (useMock) return mockApi.publishWorkflowDefinition(id)
    try {
      const response = await workflowApi.publishWorkflow(id)
      return { code: 200, message: '发布成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '发布失败', data: false }
    }
  },
  async deleteDefinition(id: number) {
    if (useMock) return { code: 200, message: '删除成功', data: true }
    try {
      const response = await workflowApi.deleteDefinition(id)
      return { code: 200, message: '删除成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '删除失败', data: false }
    }
  },
  async getConfig(id: number) {
    if (useMock) return mockApi.getConfig(id)
    try {
      const response = await workflowApi.getConfig(id)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取配置失败', data: null }
    }
  },
  async saveConfig(id: number, config: any) {
    if (useMock) return { code: 200, message: '保存成功', data: null }
    try {
      const response = await workflowApi.saveConfig(id, config)
      return { code: 200, message: '保存成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '保存失败', data: null }
    }
  }
}

export const taskService = {
  async getPendingTasks(params: any) {
    if (useMock) return mockApi.getPendingTasks()
    try {
      const response = await taskApi.getPendingTasks(params)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: emptyPage<WorkflowTask>() }
    }
  },
  async approveTask(taskId: number, data: any) {
    if (useMock) return mockApi.approveTask(taskId, data)
    try {
      const response = await taskApi.approveTask(taskId, data)
      return { code: 200, message: '审批成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '审批失败', data: false }
    }
  },
  async transferTask(taskId: number, data: any) {
    if (useMock) return mockApi.transferTask(taskId, data)
    try {
      const response = await taskApi.transferTask(taskId, data)
      return { code: 200, message: '转办成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '转办失败', data: false }
    }
  }
}

export const instanceService = {
  async getMyInstances(params: any) {
    if (useMock) return mockApi.getMyInstances()
    try {
      const response = await instanceApi.getMyInstances(params)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: emptyPage<WorkflowInstance>() }
    }
  },
  async getInstanceDetail(instanceId: number) {
    if (useMock) return { code: 200, message: '成功', data: { instance: { id: instanceId, status: 'RUNNING' }, tasks: [], history: [], variables: {} } }
    try {
      const response = await instanceApi.getInstanceDetail(instanceId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取详情失败', data: null }
    }
  },
  async getInstanceInfo(instanceId: number) {
    if (useMock) return { code: 200, message: '成功', data: null }
    try {
      const response = await instanceApi.getInstanceInfo(instanceId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: null }
    }
  },
  async getInstanceFormData(instanceId: number) {
    if (useMock) return { code: 200, message: '成功', data: null }
    try {
      const response = await instanceApi.getInstanceFormData(instanceId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: null }
    }
  },
  async getInstanceGraph(instanceId: number) {
    if (useMock) return { code: 200, message: '成功', data: null }
    try {
      const response = await instanceApi.getInstanceGraph(instanceId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: null }
    }
  },
  async getInstanceTasks(instanceId: number) {
    if (useMock) return { code: 200, message: '成功', data: [] }
    try {
      const response = await instanceApi.getInstanceTasks(instanceId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: [] }
    }
  },
  async getInstanceHistory(instanceId: number) {
    if (useMock) return { code: 200, message: '成功', data: [] }
    try {
      const response = await instanceApi.getInstanceHistory(instanceId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: [] }
    }
  },
  async startInstance(data: any) {
    if (useMock) return { code: 200, message: '启动成功', data: 1 }
    try {
      const response = await instanceApi.startInstance(data)
      return { code: 200, message: '启动成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '启动失败', data: null }
    }
  },
  async cancelInstance(id: number, reason: string) {
    if (useMock) return { code: 200, message: '终止成功', data: true }
    try {
      const response = await instanceApi.cancelInstance(id, reason)
      return { code: 200, message: '终止成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '终止失败', data: false }
    }
  }
}

export const ccService = {
  async getMyCc(params: any) {
    if (useMock) return mockApi.getMyCc()
    try {
      const response = await ccApi.getMyCc(params)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '获取失败', data: emptyPage<WorkflowCcVO>() }
    }
  },
  async markAsRead(id: number) {
    if (useMock) return { code: 200, message: '标记成功', data: true }
    try {
      const response = await ccApi.markAsRead(id)
      return { code: 200, message: '标记成功', data: response.data.data }
    } catch (error) {
      return { code: 500, message: '标记失败', data: false }
    }
  }
}

export const formService = {
  async getFormDetail(formId: number) {
    if (useMock) return mockApi.getFormDetail(formId)
    try {
      const response = await formApi.getFormDetail(formId)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      console.error('获取表单详情失败:', error)
      return { code: 500, message: '获取失败', data: null }
    }
  }
}

export const templateService = {
  async getTemplates(params?: any) {
    if (useMock) return { code: 200, message: '成功', data: emptyPage<WorkflowTemplate>() }
    try {
      const response = await templateApi.getTemplates(params)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      console.error('获取模板列表失败:', error)
      return { code: 500, message: '获取失败', data: emptyPage<WorkflowTemplate>() }
    }
  },
  async getTemplateDetail(id: number) {
    if (useMock) return { code: 200, message: '成功', data: null }
    try {
      const response = await templateApi.getTemplateDetail(id)
      return { code: 200, message: '成功', data: response.data.data }
    } catch (error) {
      console.error('获取模板详情失败:', error)
      return { code: 500, message: '获取失败', data: null }
    }
  },
  async createTemplate(data: any) {
    if (useMock) return { code: 200, message: '创建成功', data: null }
    try {
      const response = await templateApi.createTemplate(data)
      return { code: 200, message: '创建成功', data: response.data.data }
    } catch (error) {
      console.error('创建模板失败:', error)
      return { code: 500, message: '创建失败', data: null }
    }
  },
  async updateTemplate(id: number, data: any) {
    if (useMock) return { code: 200, message: '更新成功', data: null }
    try {
      const response = await templateApi.updateTemplate(id, data)
      return { code: 200, message: '更新成功', data: response.data.data }
    } catch (error) {
      console.error('更新模板失败:', error)
      return { code: 500, message: '更新失败', data: null }
    }
  },
  async deleteTemplate(id: number) {
    if (useMock) return { code: 200, message: '删除成功', data: true }
    try {
      const response = await templateApi.deleteTemplate(id)
      return { code: 200, message: '删除成功', data: response.data.data }
    } catch (error) {
      console.error('删除模板失败:', error)
      return { code: 500, message: '删除失败', data: false }
    }
  },
  async publishTemplate(id: number) {
    if (useMock) return { code: 200, message: '发布成功', data: true }
    try {
      const response = await templateApi.publishTemplate(id)
      return { code: 200, message: '发布成功', data: response.data.data }
    } catch (error) {
      console.error('发布模板失败:', error)
      return { code: 500, message: '发布失败', data: false }
    }
  },
  async saveTemplateConfig(id: number, config: any) {
    if (useMock) return { code: 200, message: '保存成功', data: null }
    try {
      const response = await templateApi.saveTemplateConfig(id, config)
      return { code: 200, message: '保存成功', data: response.data.data }
    } catch (error) {
      console.error('保存模板配置失败:', error)
      return { code: 500, message: '保存失败', data: null }
    }
  },
  async createDefinitionFromTemplate(id: number, data: any) {
    if (useMock) return { code: 200, message: '创建成功', data: null }
    try {
      const response = await templateApi.createDefinitionFromTemplate(id, data)
      return { code: 200, message: '创建成功', data: response.data.data }
    } catch (error) {
      console.error('创建流程定义失败:', error)
      return { code: 500, message: '创建失败', data: null }
    }
  }
}

export const userService = {
  async getUsers(params?: { keyword?: string; dept?: string }) {
    if (useMock) return mockApi.getUsers()
    try {
      const response = await userApi.getUsers(params)
      return { code: 200, message: '成功', data: response.data.data || [] }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return { code: 500, message: '获取失败', data: [] }
    }
  },
  async getDepartments() {
    if (useMock) return { code: 200, message: '成功', data: [] }
    try {
      const response = await userApi.getDepartments()
      return { code: 200, message: '成功', data: response.data.data || [] }
    } catch (error) {
      console.error('获取部门列表失败:', error)
      return { code: 500, message: '获取失败', data: [] }
    }
  },
  async getRoles() {
    if (useMock) return { code: 200, message: '成功', data: [] }
    try {
      const response = await userApi.getRoles()
      return { code: 200, message: '成功', data: response.data.data || [] }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      return { code: 500, message: '获取失败', data: [] }
    }
  },
  async getCurrentUser() {
    if (useMock) return mockApi.getCurrentUser()
    try {
      return { code: 200, message: '成功', data: { id: 'user001', name: '当前用户' } }
    } catch (error) {
      return { code: 500, message: '获取失败', data: null }
    }
  }
}

export const statisticsService = {
  async getStatistics(userId: string) {
    if (useMock) return mockApi.getStatistics()
    try {
      const [pendingTasksResponse, myInstancesResponse] = await Promise.all([
        taskApi.getPendingTasks({ userId, pageSize: 1 }),
        instanceApi.getMyInstances({ userId, pageSize: 1 })
      ])
      return {
        code: 200,
        message: '成功',
        data: {
          totalInstances: myInstancesResponse.data.data.total || 0,
          pendingTasks: pendingTasksResponse.data.data.total || 0,
          completedInstances: 0,
          runningInstances: 0,
          myPendingTasks: pendingTasksResponse.data.data.total || 0
        }
      }
    } catch (error) {
      return { code: 500, message: '获取失败', data: { totalInstances: 0, pendingTasks: 0, completedInstances: 0, runningInstances: 0, myPendingTasks: 0 } }
    }
  }
}

// 3. 兼容性导出 (保留 apiService 以支持旧代码，但推荐使用上述具名导出)
export const apiService = {
  template: templateService,
  workflow: workflowService,
  task: taskService,
  instance: instanceService,
  cc: ccService,
  form: formService,
  user: userService,
  statistics: statisticsService
}

export const config = {
  isDevelopment,
  useMock,
  apiBaseUrl: '/api'
}
