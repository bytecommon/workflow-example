import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export interface WorkflowDefinition {
  id: number
  workflowKey: string
  workflowName: string
  version: number
  workflowDesc?: string
  category?: string
  formId?: number
  icon?: string
  status: number
  createTime: string
  updateTime: string
}

export interface WorkflowInstance {
  id: number
  instanceNo: string
  workflowName: string
  status: string  // RUNNING, APPROVED, REJECTED, CANCELED, TERMINATED
  title: string
  startTime: string
  endTime?: string
  priority: number  // 0-普通, 1-紧急, 2-特急
}

export interface WorkflowTask {
  id: number
  instanceId: number
  instanceNo: string
  workflowName: string
  nodeName: string
  status: string  // PENDING, APPROVED, REJECTED, TRANSFERRED, CANCELED
  title: string
  startUserName: string
  createTime: string
  priority: number  // 0-普通, 1-紧急, 2-特急
}

export interface WorkflowHistory {
  id: number
  nodeName: string
  action: string  // START, APPROVE, REJECT, TRANSFER, CANCEL
  operatorName: string
  comment?: string
  operateTime: string
  duration?: number  // 毫秒
}

export interface InstanceDetailVO {
  id: number
  instanceNo: string
  workflowName: string
  status: string  // RUNNING, APPROVED, REJECTED, CANCELED, TERMINATED
  title: string
  formData?: string  // JSON 格式
  startUserId: string
  startUserName: string
  startTime: string
  endTime?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 流程定义相关API
export const workflowApi = {
  // 获取流程定义列表
  getDefinitions: (params?: {
    pageNum?: number
    pageSize?: number
    workflowName?: string
    status?: number
    category?: string
  }) => 
    api.get<ApiResponse<Page<WorkflowDefinition>>>('/workflow/definition', { params }),
  
  // 获取工作流详情
  getWorkflowDetail: (id: number) => 
    api.get<ApiResponse<WorkflowDetailVO>>(`/workflow/definition/${id}`),
  
  // 创建工作流定义
  createDefinition: (data: {
    workflowKey: string
    workflowName: string
    workflowDesc?: string
    category?: string
    formId?: number
    icon?: string
  }) => 
    api.post<ApiResponse<number>>('/workflow/definition', data),
  
  // 更新工作流定义
  updateDefinition: (id: number, data: {
    workflowKey: string
    workflowName: string
    workflowDesc?: string
    category?: string
    formId?: number
    icon?: string
  }) => 
    api.put<ApiResponse<void>>(`/workflow/definition/${id}`, data),
  
  // 删除工作流定义
  deleteDefinition: (id: number) => 
    api.delete<ApiResponse<void>>(`/workflow/definition/${id}`),
  
  // 发布工作流
  publishWorkflow: (id: number) => 
    api.post<ApiResponse<void>>(`/workflow/definition/${id}/publish`),
  
  // 保存工作流配置
  saveConfig: (id: number, config: {
    // 配置参数根据实际需要定义
    formSchema?: any
    approvalRules?: any[]
  }) => 
    api.post<ApiResponse<void>>(`/workflow/definition/${id}/config`, config),
}

// 流程实例相关API
export const instanceApi = {
  // 获取我发起的流程实例列表
  getMyInstances: (params: {
    userId: string
    pageNum?: number
    pageSize?: number
    definitionName?: string
    status?: number
  }) => 
    api.get<ApiResponse<Page<WorkflowInstance>>>('/workflow/instance/my', { params }),
  
  // 获取流程实例详情
  getInstanceDetail: (instanceId: number) => 
    api.get<ApiResponse<InstanceDetailVO>>(`/workflow/instance/${instanceId}`),
  
  // 启动流程实例
  startInstance: (data: {
    definitionId: number
    starterUserId: string
    variables?: Record<string, any>
  }) => 
    api.post<ApiResponse<number>>('/workflow/instance/start', data),
  
  // 撤销流程
  cancelInstance: (instanceId: number, reason: string) => 
    api.post<ApiResponse<void>>(`/workflow/instance/${instanceId}/cancel`, null, { 
      params: { reason } 
    }),
  
  // 获取流程审批历史
  getInstanceHistory: (instanceId: number) => 
    api.get<ApiResponse<WorkflowHistory[]>>(`/workflow/instance/${instanceId}/history`),
}

// 任务相关API
export const taskApi = {
  // 获取我的待办任务列表
  getPendingTasks: (params: {
    userId: string
    pageNum?: number
    pageSize?: number
    definitionName?: string
    nodeName?: string
  }) => 
    api.get<ApiResponse<Page<WorkflowTask>>>('/workflow/task/pending', { params }),
  
  // 审批任务
  approveTask: (taskId: number, data: {
    userId: string
    comment?: string
    action: string
  }) => 
    api.post<ApiResponse<void>>(`/workflow/task/${taskId}/approve`, data),
  
  // 转交任务
  transferTask: (taskId: number, data: {
    userId: string
    targetUserId: string
    comment?: string
  }) => 
    api.post<ApiResponse<void>>(`/workflow/task/${taskId}/transfer`, data),
}

// 抄送相关API
export const ccApi = {
  // 获取我的抄送
  getMyCc: (params: {
    userId: string
    pageNum?: number
    pageSize?: number
  }) => 
    api.get<ApiResponse<Page<WorkflowCcVO>>>('/workflow/cc/my', { params }),
  
  // 标记为已读
  markAsRead: (id: number) => 
    api.post<ApiResponse<void>>(`/workflow/cc/${id}/read`),
}

// 分页响应类型定义
export interface Page<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 扩展接口定义以匹配后台VO结构
export interface WorkflowDetailVO {
  id: number
  name: string
  key: string
  version: number
  description?: string
  status: number
  createTime: string
  updateTime: string
  // 可以添加更多字段
}

export interface WorkflowCcVO {
  id: number
  instanceId: string
  definitionName: string
  nodeName: string
  senderName: string
  createTime: string
  read: boolean
}

export default api
