import { workflowApi, instanceApi, taskApi, ccApi, formApi, type Page } from './api'
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
        const workflowData = mockApi.getWorkflowDefinitions().find(w => w.id === id)
        if (!workflowData) {
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
            id: workflowData.id,
            workflowKey: workflowData.workflowKey,
            workflowName: workflowData.workflowName,
            version: workflowData.version,
            workflowDesc: workflowData.workflowDesc,
            category: workflowData.category,
            formId: workflowData.formId,
            icon: workflowData.icon,
            status: workflowData.status,
            createTime: workflowData.createTime,
            updateTime: workflowData.updateTime,
            createBy: 'admin',
            updateBy: 'admin',
            nodes: [
              { id: 1, nodeName: '开始', nodeType: 'START', positionX: 50, positionY: 200 },
              { id: 2, nodeName: '提交申请', nodeType: 'APPROVE', positionX: 200, positionY: 200 },
              { id: 3, nodeName: '部门审批', nodeType: 'APPROVE', positionX: 370, positionY: 130 },
              { id: 4, nodeName: 'HR审批', nodeType: 'APPROVE', positionX: 370, positionY: 270 },
              { id: 5, nodeName: '最终审批', nodeType: 'APPROVE', positionX: 540, positionY: 200 },
              { id: 6, nodeName: '结束', nodeType: 'END', positionX: 710, positionY: 200 }
            ],
            edges: [
              { id: 1, sourceNodeId: 1, targetNodeId: 2 },
              { id: 2, sourceNodeId: 2, targetNodeId: 3 },
              { id: 3, sourceNodeId: 2, targetNodeId: 4 },
              { id: 4, sourceNodeId: 3, targetNodeId: 5 },
              { id: 5, sourceNodeId: 4, targetNodeId: 5 },
              { id: 6, sourceNodeId: 5, targetNodeId: 6 }
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

    async startInstance(data: {
      workflowId: number
      startUserId: string
      startUserName?: string
      title?: string
      businessKey?: string
      priority?: number
      formData?: string
    }) {
      if (useMock) {
        console.log('Mock发起流程:', data)
        return {
          code: 200,
          message: '发起流程成功',
          data: Math.floor(Math.random() * 1000) + 100
        }
      }
      try {
        const response = await instanceApi.startInstance(data)
        console.log('真实API响应:', response)
        return {
          code: 200,
          message: '发起流程成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('发起流程实例失败:', error)
        return {
          code: 500,
          message: '发起流程实例失败',
          data: null
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
            id: instanceId,
            instanceNo: `INST-2024-${String(instanceId).padStart(3, '0')}`,
            workflowName: '请假申请流程',
            status: 'RUNNING',
            formData: JSON.stringify({
              title: '请假申请',
              startDate: '2024-01-20',
              endDate: '2024-01-22',
              days: 3,
              reason: '家中有事需要处理',
              department: '技术部'
            }),
            startUserId: 'user001',
            startUserName: '张三',
            startTime: '2024-01-15T09:00:00',
            endTime: null,
            title: '张三的请假申请'
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

    async getInstanceInfo(instanceId: number) {
      if (useMock) {
        return {
          code: 200,
          message: '成功',
          data: {
            id: instanceId,
            instanceNo: `INST-2024-${String(instanceId).padStart(3, '0')}`,
            definitionId: 1,
            workflowName: '请假申请流程',
            status: 'RUNNING',
            title: '张三的请假申请',
            startUserId: 'user001',
            startUserName: '张三',
            startTime: '2024-01-15T09:00:00',
            endTime: null,
            priority: 0,
            currentNodeName: '部门经理审批'
          }
        }
      }
      try {
        const response = await instanceApi.getInstanceInfo(instanceId)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程实例基本信息失败:', error)
        return {
          code: 500,
          message: '获取流程实例基本信息失败',
          data: null
        }
      }
    },

    async getInstanceFormData(instanceId: number) {
      if (useMock) {
        return {
          code: 200,
          message: '成功',
          data: {
            instanceId: instanceId,
            instanceNo: `INST-2024-${String(instanceId).padStart(3, '0')}`,
            formId: 1,
            formName: '请假申请表',
            formConfig: JSON.stringify({
              fields: [
                { name: 'title', label: '标题', type: 'text', required: true },
                { name: 'startDate', label: '开始日期', type: 'date', required: true },
                { name: 'endDate', label: '结束日期', type: 'date', required: true },
                { name: 'days', label: '天数', type: 'number', required: true },
                { name: 'reason', label: '请假事由', type: 'textarea', required: true },
                { name: 'department', label: '所属部门', type: 'text', required: true }
              ]
            }),
            formData: JSON.stringify({
              title: '请假申请',
              startDate: '2024-01-20',
              endDate: '2024-01-22',
              days: 3,
              reason: '家中有事需要处理',
              department: '技术部'
            }),
            dataMap: {
              title: '请假申请',
              startDate: '2024-01-20',
              endDate: '2024-01-22',
              days: 3,
              reason: '家中有事需要处理',
              department: '技术部'
            }
          }
        }
      }
      try {
        const response = await instanceApi.getInstanceFormData(instanceId)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程实例表单数据失败:', error)
        return {
          code: 500,
          message: '获取流程实例表单数据失败',
          data: null
        }
      }
    },

    async getInstanceGraph(instanceId: number) {
      if (useMock) {
        return {
          code: 200,
          message: '成功',
          data: {
            instanceId: instanceId,
            instanceNo: `INST-2024-${String(instanceId).padStart(3, '0')}`,
            workflowName: '请假申请流程',
            status: 'RUNNING',
            nodes: [
              { id: 1, nodeName: '开始', nodeType: 'START', positionX: 50, positionY: 200 },
              { id: 2, nodeName: '提交申请', nodeType: 'APPROVE', positionX: 200, positionY: 200 },
              { id: 3, nodeName: '部门审批', nodeType: 'APPROVE', positionX: 370, positionY: 130 },
              { id: 4, nodeName: 'HR审批', nodeType: 'APPROVE', positionX: 370, positionY: 270 },
              { id: 5, nodeName: '最终审批', nodeType: 'APPROVE', positionX: 540, positionY: 200 },
              { id: 6, nodeName: '结束', nodeType: 'END', positionX: 710, positionY: 200 }
            ],
            edges: [
              { id: 1, sourceNodeId: 1, targetNodeId: 2 },
              { id: 2, sourceNodeId: 2, targetNodeId: 3 },
              { id: 3, sourceNodeId: 2, targetNodeId: 4 },
              { id: 4, sourceNodeId: 3, targetNodeId: 5 },
              { id: 5, sourceNodeId: 4, targetNodeId: 5 },
              { id: 6, sourceNodeId: 5, targetNodeId: 6 }
            ],
            currentNodeId: 3,
            completedNodeIds: [1, 2]
          }
        }
      }
      try {
        const response = await instanceApi.getInstanceGraph(instanceId)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程实例流程图失败:', error)
        return {
          code: 500,
          message: '获取流程实例流程图失败',
          data: null
        }
      }
    },

    async getInstanceTasks(instanceId: number) {
      if (useMock) {
        return {
          code: 200,
          message: '成功',
          data: [
            {
              id: 1,
              instanceId: instanceId,
              instanceNo: `INST-2024-${String(instanceId).padStart(3, '0')}`,
              workflowName: '请假申请流程',
              nodeName: '发起申请',
              status: 'APPROVED',
              title: '张三的请假申请',
              startUserName: '张三',
              createTime: '2024-01-15T09:00:00',
              priority: 0
            },
            {
              id: 2,
              instanceId: instanceId,
              instanceNo: `INST-2024-${String(instanceId).padStart(3, '0')}`,
              workflowName: '请假申请流程',
              nodeName: '部门经理审批',
              status: 'PENDING',
              title: '张三的请假申请',
              startUserName: '张三',
              createTime: '2024-01-15T09:05:00',
              priority: 0
            }
          ]
        }
      }
      try {
        const response = await instanceApi.getInstanceTasks(instanceId)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程实例任务列表失败:', error)
        return {
          code: 500,
          message: '获取流程实例任务列表失败',
          data: []
        }
      }
    },

    async getInstanceHistory(instanceId: number) {
      if (useMock) {
        return {
          code: 200,
          message: '成功',
          data: [
            {
              id: 1,
              nodeName: '发起申请',
              action: 'START',
              operatorName: '张三',
              comment: '提交申请',
              operateTime: '2024-01-15T09:00:00',
              duration: 300000
            },
            {
              id: 2,
              nodeName: '发起申请',
              action: 'APPROVE',
              operatorName: '系统自动',
              comment: '申请提交完成',
              operateTime: '2024-01-15T09:05:00',
              duration: 0
            }
          ]
        }
      }
      try {
        const response = await instanceApi.getInstanceHistory(instanceId)
        return {
          code: 200,
          message: '成功',
          data: response.data.data
        }
      } catch (error) {
        console.error('获取流程审批历史失败:', error)
        return {
          code: 500,
          message: '获取流程审批历史失败',
          data: []
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
  },

  // 表单相关
  form: {
    async getFormDetail(formId: number) {
      if (useMock) {
        const mockResponse = await mockApi.getFormDetail(formId)
        // Mock数据已经是解析后的对象，直接返回
        return mockResponse
      }
      try {
        const axiosResponse = await formApi.getFormDetail(formId)
        console.log('=== 表单API完整响应 ===')
        console.log('axios响应对象:', axiosResponse)
        console.log('axios响应数据:', axiosResponse.data)
        console.log('axios响应状态:', axiosResponse.status)

        // axios的响应结构：response.data包含实际API返回的数据
        const apiResponse = axiosResponse.data
        console.log('API响应的data字段:', apiResponse.data)
        console.log('API响应的code字段:', apiResponse.code)
        console.log('API响应的message字段:', apiResponse.message)

        if (apiResponse.code === 200 && apiResponse.data) {
          console.log('=== 开始解析表单配置 ===')
          // 解析formConfig JSON字符串
          const form: any = { ...apiResponse.data }
          console.log('表单对象:', form)

          if (form.formConfig) {
            try {
              console.log('formConfig原始值:', form.formConfig)
              console.log('formConfig类型:', typeof form.formConfig)
              const config = JSON.parse(form.formConfig)
              console.log('解析后的config:', config)
              console.log('config.fields:', config.fields)
              form.fields = config.fields || []
              console.log('表单字段数量:', form.fields.length)
            } catch (e) {
              console.error('解析formConfig失败:', e)
              form.fields = []
            }
          } else {
            console.warn('表单对象中没有formConfig字段')
            form.fields = []
          }

          console.log('=== 最终返回的表单数据 ===')
          console.log('表单ID:', form.id)
          console.log('表单名称:', form.formName)
          console.log('表单字段:', form.fields)
          console.log('=====================')

          return {
            code: 200,
            message: '成功',
            data: form
          }
        }

        console.warn('API响应不符合预期, code:', apiResponse.code, 'data:', apiResponse.data)
        return {
          code: apiResponse.code || 404,
          message: apiResponse.message || '表单不存在',
          data: null
        }
      } catch (error) {
        console.error('=== 获取表单详情失败 ===')
        console.error('错误详情:', error)
        return {
          code: 500,
          message: '获取表单详情失败',
          data: null
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