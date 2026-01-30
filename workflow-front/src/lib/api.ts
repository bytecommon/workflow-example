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
  status: number  // 0-未启用, 1-已启用
  createTime: string
  updateTime: string
  createBy?: string
  updateBy?: string
}

export interface WorkflowInstance {
  id: number                    // 流程实例ID
  instanceNo: string            // 流程实例编号
  definitionId: number          // 流程定义ID
  definitionName: string        // 流程定义名称
  definitionKey: string         // 流程定义Key
  workflowName: string          // 工作流名称（兼容字段）
  title: string                 // 流程标题
  status: number                // 流程状态：1-运行中，2-已完成，3-已终止，4-已撤销
  statusText?: string           // 状态文本
  priority: number              // 优先级：0-普通，1-紧急，2-特急
  startTime: string             // 发起时间
  endTime?: string              // 结束时间
  starterUserId: string         // 发起人ID
  starterUserName: string       // 发起人名称
  currentTaskId?: number        // 当前任务ID
  variables?: Record<string, any> // 流程变量
}

export interface WorkflowTask {
  id: number
  taskId: string
  instanceId: string
  definitionId: number
  definitionName: string
  nodeId: string
  nodeName: string
  assigneeId: string
  assigneeName: string
  status: number
  statusText: string
  createTime: string
  dueTime?: string
  claimTime?: string
  finishTime?: string
}

export interface WorkflowHistory {
  id: number
  instanceId: string
  taskId: string
  nodeId: string
  nodeName: string
  action: string
  actionText: string
  operatorId: string
  operatorName: string
  comment?: string
  createTime: string
}

export interface InstanceDetailVO {
  id: number                      // 流程实例ID
  instanceNo: string               // 流程实例编号
  workflowName: string             // 工作流名称
  status: string                   // 流程状态：RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止
  formData: string                // 表单数据（JSON格式）
  startUserId: string              // 发起人用户ID
  startUserName: string            // 发起人姓名
  startTime: string                // 发起时间
  endTime: string | null          // 结束时间
  title: string                   // 流程标题
}

export interface InstanceInfoVO {
  id: number                      // 流程实例ID
  instanceNo: string               // 流程实例编号
  definitionId: number            // 工作流ID
  workflowName: string             // 工作流名称
  status: string                   // 流程状态：RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止
  title: string                   // 流程标题
  startUserId: string              // 发起人用户ID
  startUserName: string            // 发起人姓名
  startTime: string                // 发起时间
  endTime: string | null          // 结束时间
  priority: number                // 优先级：0-普通，1-紧急，2-特急
  currentNodeName: string         // 当前节点名称
}

export interface InstanceFormDataVO {
  instanceId: number              // 流程实例ID
  instanceNo: string               // 流程实例编号
  formId: number                  // 表单ID
  formName: string                // 表单名称
  formConfig: string              // 表单配置（JSON格式）
  formData: string                // 表单数据（JSON格式）
  dataMap: Record<string, any>    // 表单数据（解析为Map）
}

export interface InstanceGraphVO {
  instanceId: number              // 流程实例ID
  instanceNo: string               // 流程实例编号
  workflowName: string             // 工作流名称
  status: string                   // 流程状态
  nodes: Array<{
    id: number
    nodeName: string
    nodeType: string
    positionX: number
    positionY: number
  }>                              // 节点列表
  edges: Array<{
    id: number
    sourceNodeId: number
    targetNodeId: number
  }>                              // 连线列表
  currentNodeId: number           // 当前节点ID
  completedNodeIds: number[]      // 已完成节点ID列表
}

export interface TaskVO {
  id: number
  instanceId: number
  instanceNo: string
  workflowName: string
  nodeName: string
  status: string  // PENDING-待处理，APPROVED-已同意，REJECTED-已拒绝，TRANSFERRED-已转交，CANCELED-已取消
  title: string
  startUserName: string
  createTime: string
  priority: number  // 0-普通，1-紧急，2-特急
}

export interface HistoryVO {
  id: number
  nodeName: string
  action: string  // START-发起，APPROVE-同意，REJECT-拒绝，TRANSFER-转交，CANCEL-撤销
  operatorName: string
  comment?: string
  operateTime: string  // 操作时间（后端返回operateTime）
  duration?: number  // 处理耗时（毫秒）
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

  // 获取流程图数据
  getWorkflowGraph: (id: number) =>
    api.get<ApiResponse<WorkflowDetailVO>>(`/workflow/definition/${id}/graph`),
  
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

  // 获取流程实例详情（基本信息+表单数据）
  getInstanceDetail: (instanceId: number) =>
    api.get<ApiResponse<InstanceDetailVO>>(`/workflow/instance/${instanceId}`),

  // 获取流程实例基本信息
  getInstanceInfo: (instanceId: number) =>
    api.get<ApiResponse<InstanceInfoVO>>(`/workflow/instance/${instanceId}/info`),

  // 获取流程实例表单数据
  getInstanceFormData: (instanceId: number) =>
    api.get<ApiResponse<InstanceFormDataVO>>(`/workflow/instance/${instanceId}/form`),

  // 获取流程实例流程图
  getInstanceGraph: (instanceId: number) =>
    api.get<ApiResponse<InstanceGraphVO>>(`/workflow/instance/${instanceId}/graph`),

  // 获取流程实例任务列表
  getInstanceTasks: (instanceId: number) =>
    api.get<ApiResponse<TaskVO[]>>(`/workflow/instance/${instanceId}/tasks`),

  // 获取流程审批历史
  getInstanceHistory: (instanceId: number) =>
    api.get<ApiResponse<HistoryVO[]>>(`/workflow/instance/${instanceId}/history`),

  // 启动流程实例
  startInstance: (data: {
    workflowId: number          // 工作流定义ID
    startUserId: string        // 发起人用户ID
    startUserName?: string    // 发起人姓名
    title?: string            // 流程标题
    businessKey?: string      // 业务键
    priority?: number         // 优先级
    formData?: string        // 表单数据（JSON字符串）
  }) =>
    api.post<ApiResponse<number>>('/workflow/instance/start', data),

  // 撤销流程
  cancelInstance: (instanceId: number, reason: string) =>
    api.post<ApiResponse<void>>(`/workflow/instance/${instanceId}/cancel`, null, {
      params: { reason }
    }),
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
  createBy?: string
  updateBy?: string
  // 流程图数据
  nodes?: WorkflowNodeVO[]
  edges?: WorkflowEdgeVO[]
  // 统计信息
  statistics?: {
    totalInstances: number
    runningInstances: number
    completedInstances: number
  }
}

export interface WorkflowNodeVO {
  id: number
  nodeName: string
  nodeType: string
  positionX: number
  positionY: number
  config?: string
  createTime?: string
  updateTime?: string
}

export interface WorkflowEdgeVO {
  id: number
  sourceNodeId: number
  targetNodeId: number
  conditionExpr?: string
  priority?: number
  createTime?: string
}

export interface WorkflowCcVO {
  id: number
  instanceId: number
  instanceNo: string
  workflowName: string
  nodeName: string
  title: string
  startUserName: string
  status: number  // 0-未读,1-已读
  createTime: string
  readTime?: string
}

// 表单相关接口定义
export interface FormField {
  name: string          // 字段名称（对应fieldKey）
  label: string         // 字段显示名称（对应fieldName）
  type: string          // 字段类型：text, textarea, number, date, select, checkbox等
  placeholder?: string  // 占位符
  defaultValue?: any   // 默认值
  required?: boolean    // 是否必填
  options?: FormFieldOption[] | string[]  // 下拉选项（支持对象数组或字符串数组）
  validation?: {
    pattern?: string
    min?: number
    max?: number
  }
  description?: string  // 字段描述（对应fieldDesc）
}

export interface FormFieldOption {
  label: string
  value?: string  // value可以为undefined，如果是字符串数组格式
}

export interface FormDefinition {
  id: number
  formKey: string        // 表单唯一标识
  formName: string      // 表单名称
  formDesc?: string     // 表单描述
  formConfig: string    // 表单配置（JSON字符串）
  status: number        // 状态：0-停用，1-启用
  createTime: string
  updateTime: string
  // 解析后的字段（前端使用）
  fields?: FormField[]
}

// 表单相关API
export const formApi = {
  // 获取表单详情
  getFormDetail: (formId: number) =>
    api.get<ApiResponse<FormDefinition>>(`/form/${formId}`),
}

export default api