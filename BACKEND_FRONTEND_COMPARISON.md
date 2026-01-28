# 后端 API 与前端代码详细对比分析报告

## 📋 概览

本项目包含完整的后端 Spring Boot 实现和前端 React 实现。本报告对比两者之间的接口定义，列出所有不匹配之处。

---

## 🔍 核心发现

### 后端响应格式
```java
// Result.java
{
  "code": Integer,      // 200-成功，500-失败
  "message": String,    // 响应消息
  "data": T            // 实际数据
}
```

### 前端期望格式 (api.ts)
```typescript
{
  "code": number,
  "message": string,
  "data": T
}
```
✅ **一致** - 两者响应格式匹配

---

## 📊 API 端点对比

### 1. 流程定义相关 API

#### 1.1 获取流程定义列表

**后端 (WorkflowController.getDefinitions)**
```java
GET /api/workflow/definition
参数: WorkflowDefinitionQueryDTO {
  workflowName: String (可选)
  category: String (可选)
  status: Integer (可选)
  pageNum: Integer (默认1)
  pageSize: Integer (默认10)
}
返回: Result<Page<WorkflowDefinitionVO>>
```

**前端 (api.ts - workflowApi.getDefinitions)**
```typescript
GET /workflow/definition
参数: {
  pageNum?: number
  pageSize?: number
  workflowName?: string   // ✅ 已匹配
  status?: number
  category?: string
}
返回: ApiResponse<Page<WorkflowDefinition>>
```

✅ **已正确修复** - 参数名完全匹配

---

#### 1.2 获取工作流详情

**后端 (WorkflowController.getWorkflowDetail)**
```java
GET /api/workflow/definition/{id}
路径参数: id: Long
返回: Result<WorkflowDetailVO> {
  id: Long
  workflowKey: String
  workflowName: String
  workflowDesc: String
  category: String
  formId: Long
  status: Integer (0-停用，1-启用)
  nodes: List<WorkflowNode>
  edges: List<WorkflowEdge>
  approvers: List<WorkflowApprover>
}
```

**前端 (api.ts - workflowApi.getWorkflowDetail)**
```typescript
GET /workflow/definition/{id}
返回: ApiResponse<WorkflowDetailVO> {
  id: number
  name: string          // ❌ 后端是 workflowName
  key: string           // ❌ 后端是 workflowKey
  version: number       // ❌ 后端没有
  description?: string  // ❌ 后端是 workflowDesc
  status: number        // ❌ 但含义不同
  createTime: string    // ❌ 后端没有在 detail 中返回
  updateTime: string    // ❌ 后端没有在 detail 中返回
  // 缺少：nodes, edges, approvers
}
```

❌ **需要修复** - 字段名严重不匹配

---

#### 1.3 创建工作流定义

**后端 (WorkflowController.createDefinition)**
```java
POST /api/workflow/definition
Body: WorkflowDefinitionDTO {
  @NotBlank workflowKey: String      (必填)
  @NotBlank workflowName: String     (必填)
  workflowDesc: String
  category: String
  formId: Long
  icon: String
}
返回: Result<Long> (返回新创建的 ID)
```

**前端 (api.ts - workflowApi.createDefinition)**
```typescript
POST /workflow/definition
Body: {
  workflowKey: string
  workflowName: string
  workflowDesc?: string
  category?: string
  formId?: number
  icon?: string
}
返回: ApiResponse<number>
```

✅ **一致** - 完全匹配

---

#### 1.4 更新工作流定义

**后端 (WorkflowController.updateDefinition)**
```java
PUT /api/workflow/definition/{id}
Body: WorkflowDefinitionDTO (同创建)
返回: Result<Void>
```

**前端 (api.ts - workflowApi.updateDefinition)**
```typescript
PUT /workflow/definition/{id}
Body: 与后端一致
返回: ApiResponse<void>
```

✅ **一致**

---

#### 1.5 删除工作流定义

**后端 (WorkflowController.deleteDefinition)**
```java
DELETE /api/workflow/definition/{id}
返回: Result<Void>
```

**前端 (api.ts - workflowApi.deleteDefinition)**
```typescript
DELETE /workflow/definition/{id}
返回: ApiResponse<void>
```

✅ **一致**

---

#### 1.6 发布工作流

**后端 (WorkflowController.publishWorkflow)**
```java
POST /api/workflow/definition/{id}/publish
返回: Result<Void>
```

**前端 (api.ts - workflowApi.publishWorkflow)**
```typescript
POST /workflow/definition/{id}/publish
返回: ApiResponse<void>
```

✅ **一致**

---

#### 1.7 保存工作流配置

**后端 (WorkflowController.saveConfig)**
```java
POST /api/workflow/definition/{id}/config
Body: WorkflowConfigDTO {
  nodes: List<WorkflowNode>
  edges: List<WorkflowEdge>
  approvers: List<WorkflowApprover>
}
返回: Result<Void>
```

**前端 (api.ts - workflowApi.saveConfig)**
```typescript
POST /workflow/definition/{id}/config
Body: {
  formSchema?: any
  approvalRules?: any[]
}
```

❌ **需要修复** - 后端配置结构完全不同

---

### 2. 流程实例相关 API

#### 2.1 启动工作流

**后端 (WorkflowController.startWorkflow)**
```java
POST /api/workflow/instance/start
Body: WorkflowStartDTO {
  @NotNull workflowId: Long          (必填)
  @NotBlank startUserId: String      (必填)
  @NotBlank startUserName: String    (必填)
  @NotBlank title: String            (必填)
  formData: String (JSON)
  businessKey: String
  priority: Integer (0-普通，1-紧急，2-特急)
}
返回: Result<Long> (新建的实例 ID)
```

**前端 (api.ts - instanceApi.startInstance)**
```typescript
POST /workflow/instance/start
Body: {
  definitionId: number  // ❌ 后端是 workflowId
  starterUserId: string // ❌ 后端是 startUserId
  variables?: Record<string, any>  // ❌ 后端没有，有 formData
}
```

❌ **需要修复** - 参数名完全不同

---

#### 2.2 获取我发起的流程

**后端 (WorkflowController.getMyInstances)**
```java
GET /api/workflow/instance/my
参数: InstanceQueryDTO {
  @NotBlank userId: String    (必填)
  status: String              (RUNNING/APPROVED/REJECTED/CANCELED/TERMINATED)
  pageNum: Integer (默认1)
  pageSize: Integer (默认10)
}
返回: Result<Page<InstanceVO>> {
  id: Long
  instanceNo: String          // ✅ 前端用 instanceId
  workflowName: String
  status: String              // ✅ 前端用 statusText
  title: String
  startTime: LocalDateTime
  endTime: LocalDateTime
  priority: Integer
}
```

**前端 (api.ts - instanceApi.getMyInstances)**
```typescript
GET /workflow/instance/my
参数: {
  userId: string
  pageNum?: number
  pageSize?: number
  definitionName?: string  // ❌ 后端没有这个参数
  status?: number          // ❌ 后端是 String
}
返回: ApiResponse<Page<WorkflowInstance>> {
  id: number
  instanceId: string       // ❌ 后端是 instanceNo
  definitionId: number     // ❌ 后端没有
  definitionName: string   // ❌ 后端是 workflowName
  currentTaskId: number    // ❌ 后端没有
  status: number           // ❌ 后端是 String
  statusText: string       // ❌ 后端没有
  startTime: string
  endTime?: string
  starterUserId: string    // ❌ 后端没有
  starterUserName: string  // ❌ 后端没有
}
```

❌ **需要重大修复** - 字段结构完全不同

---

#### 2.3 获取流程实例详情

**后端 (WorkflowController.getInstanceDetail)**
```java
GET /api/workflow/instance/{instanceId}
返回: Result<InstanceDetailVO> {
  id: Long
  instanceNo: String
  workflowName: String
  status: String           // RUNNING/APPROVED/REJECTED/CANCELED/TERMINATED
  title: String
  formData: String         // JSON格式
  startUserId: String
  startUserName: String
  startTime: LocalDateTime
  endTime: LocalDateTime
}
```

**前端 (api.ts - instanceApi.getInstanceDetail)**
```typescript
GET /workflow/instance/{instanceId}
返回: ApiResponse<InstanceDetailVO> {
  id: number
  instanceId: string       // ❌ 后端是 instanceNo
  definitionId: number     // ❌ 后端没有
  definitionName: string   // ❌ 后端是 workflowName
  currentTaskId: number    // ❌ 后端没有
  status: number           // ❌ 后端是 String
  statusText: string       // ❌ 后端没有
  startTime: string
  starterUserId: string    // ❌ 后端是 startUserId
  starterUserName: string  // ✅ 一致
  // 缺少: title, formData, endTime, instanceNo
}
```

❌ **需要重大修复** - 字段定义完全不同

---

#### 2.4 撤销流程

**后端 (WorkflowController.cancelInstance)**
```java
POST /api/workflow/instance/{instanceId}/cancel
查询参数: reason: String (通过 @RequestParam)
返回: Result<Void>
```

**前端 (api.ts - instanceApi.cancelInstance)**
```typescript
POST /workflow/instance/{instanceId}/cancel
Body/Query: 不清楚
```

✅ **基本一致** - 但 Query 参数处理方式需要调整

---

#### 2.5 获取流程审批历史

**后端 (WorkflowController.getInstanceHistory)**
```java
GET /api/workflow/instance/{instanceId}/history
返回: Result<List<HistoryVO>> {
  id: Long
  nodeName: String
  action: String         // START/APPROVE/REJECT/TRANSFER/CANCEL
  operatorName: String
  comment: String
  operateTime: LocalDateTime
  duration: Long         // 毫秒
}
```

**前端 (api.ts - instanceApi.getInstanceHistory)**
```typescript
GET /workflow/instance/{instanceId}/history
返回: ApiResponse<WorkflowHistory[]> {
  id: number
  instanceId: string     // ❌ 后端没有
  taskId: string         // ❌ 后端没有
  nodeId: string         // ❌ 后端没有
  nodeName: string       // ✅ 一致
  action: string         // ✅ 一致
  actionText: string     // ❌ 后端没有
  operatorId: string     // ❌ 后端没有
  operatorName: string   // ✅ 一致
  comment?: string       // ✅ 一致
  createTime: string     // ❌ 后端是 operateTime
}
```

❌ **需要修复** - 多个字段不一致

---

### 3. 任务相关 API

#### 3.1 获取我的待办任务

**后端 (WorkflowController.getMyPendingTasks)**
```java
GET /api/workflow/task/pending
参数: TaskQueryDTO {
  @NotBlank userId: String    (必填)
  pageNum: Integer (默认1)
  pageSize: Integer (默认10)
}
返回: Result<Page<TaskVO>> {
  id: Long
  instanceId: Long             // ❌ 前端期望 String
  instanceNo: String           // ✅ 前端期望 instanceId
  workflowName: String         // ❌ 前端期望 definitionName
  nodeName: String             // ✅ 一致
  status: String               // PENDING/APPROVED/REJECTED/TRANSFERRED/CANCELED
  title: String                // ✅ 前端期望
  startUserName: String        // ✅ 一致
  createTime: LocalDateTime    // ✅ 一致
  priority: Integer            // ✅ 一致
}
```

**前端 (api.ts - taskApi.getPendingTasks)**
```typescript
GET /workflow/task/pending
参数: {
  userId: string
  pageNum?: number
  pageSize?: number
  definitionName?: string  // ❌ 后端没有
  nodeName?: string        // ❌ 后端没有
}
返回: ApiResponse<Page<WorkflowTask>> {
  id: number
  taskId: string           // ❌ 后端没有
  instanceId: string       // ❌ 后端返回 Long，但这里是 String
  definitionId: number     // ❌ 后端没有
  definitionName: string   // ❌ 后端是 workflowName
  nodeId: string           // ❌ 后端没有
  nodeName: string         // ✅ 一致
  assigneeId: string       // ❌ 后端没有
  assigneeName: string     // ❌ 后端没有
  status: number           // ❌ 后端是 String
  statusText: string       // ❌ 后端没有
  createTime: string       // ✅ 一致
  dueTime?: string         // ❌ 后端没有
  claimTime?: string       // ❌ 后端没有
  finishTime?: string      // ❌ 后端没有
}
```

❌ **需要重大修复** - 字段定义差异很大

---

#### 3.2 审批任务

**后端 (WorkflowController.approveTask)**
```java
POST /api/workflow/task/{taskId}/approve
Body: TaskApproveDTO {
  @NotNull approved: Boolean       (必填，true-同意/false-拒绝)
  @NotBlank operatorId: String     (必填)
  @NotBlank operatorName: String   (必填)
  comment: String
  attachments: String              (JSON格式)
}
返回: Result<Void>
```

**前端 (api.ts - taskApi.approveTask)**
```typescript
POST /workflow/task/{taskId}/approve
Body: {
  userId: string           // ❌ 后端是 operatorId
  comment?: string         // ✅ 一致
  action: string           // ❌ 后端是 approved: Boolean
}
```

❌ **需要修复** - 参数结构不同

---

#### 3.3 转交任务

**后端 (WorkflowController.transferTask)**
```java
POST /api/workflow/task/{taskId}/transfer
Body: TaskTransferDTO {
  @NotBlank operatorId: String       (必填)
  @NotBlank operatorName: String     (必填)
  @NotBlank targetUserId: String     (必填)
  @NotBlank targetUserName: String   (必填)
  reason: String
}
返回: Result<Void>
```

**前端 (api.ts - taskApi.transferTask)**
```typescript
POST /workflow/task/{taskId}/transfer
Body: {
  userId: string           // ❌ 后端期望 operatorId
  targetUserId: string     // ✅ 一致
  comment?: string         // ❌ 后端没有，有 reason 和 operatorName
}
```

❌ **需要修复** - 参数不完全

---

### 4. 抄送相关 API

#### 4.1 获取我的抄送

**后端 (WorkflowCcController.getMyCc)**
```java
GET /api/workflow/cc/my
查询参数:
  userId: String           (必填，通过 @RequestParam)
  pageNum: Integer         (默认1，通过 @RequestParam)
  pageSize: Integer        (默认10，通过 @RequestParam)
返回: Result<Page<WorkflowCcVO>> {
  id: Long
  instanceId: Long         // ❌ 前端期望 String
  instanceNo: String       // ❌ 前端没有
  workflowName: String
  nodeName: String
  title: String
  startUserName: String
  status: Integer          // 0-未读，1-已读
  createTime: LocalDateTime
  readTime: LocalDateTime
}
```

**前端 (api.ts - ccApi.getMyCc)**
```typescript
GET /api/workflow/cc/my
参数: {
  userId: string
  pageNum?: number
  pageSize?: number
}
返回: ApiResponse<Page<WorkflowCcVO>> {
  id: number
  instanceId: string       // ✅ 前端期望 String，但后端返回 Long
  definitionName: string   // ❌ 后端是 workflowName
  nodeName: string         // ✅ 一致
  senderName: string       // ❌ 后端没有，有 startUserName
  createTime: string       // ✅ 一致
  read: boolean            // ❌ 后端是 status: Integer (0/1)
}
```

❌ **需要修复** - 字段定义不完全匹配

---

#### 4.2 标记为已读

**后端 (WorkflowCcController.markAsRead)**
```java
POST /api/workflow/cc/{id}/read
返回: Result<Void>
```

**前端 (api.ts - ccApi.markAsRead)**
```typescript
POST /workflow/cc/{id}/read
```

✅ **一致**

---

## 📋 重要修复清单

### 高优先级（阻断性问题）

1. ❌ **WorkflowDetailVO 字段不匹配**
   - 需要更新前端类型定义
   - 需要添加 nodes, edges, approvers 字段

2. ❌ **WorkflowInstance 字段完全重新定义**
   - 字段名: id, instanceNo, workflowName, status(String), title, startTime, endTime, priority
   - 删除: instanceId, definitionId, currentTaskId, statusText
   - 添加: instanceNo

3. ❌ **InstanceDetailVO 字段重新定义**
   - 添加: formData, title
   - 删除: instanceId, definitionId, currentTaskId, statusText
   - 修改: status 为 String

4. ❌ **TaskVO 字段大幅调整**
   - 修改: instanceId 为 Long，addinstanceNo
   - 修改: workflowName (从 definitionName)
   - 删除: taskId, definitionId, nodeId, assigneeId, assigneeName, dueTime, claimTime, finishTime
   - 修改: status 为 String
   - 删除: statusText

5. ❌ **WorkflowStartDTO 参数调整**
   - workflowId (从 definitionId)
   - startUserId, startUserName (不同的参数名)
   - 删除: variables，添加 formData, businessKey, priority

6. ❌ **TaskApproveDTO 参数调整**
   - approved: Boolean (从 action: String)
   - operatorId, operatorName (不同的参数名)
   - 添加: attachments

### 中优先级（功能问题）

7. ❌ **HistoryVO 字段调整**
   - operateTime (从 createTime)
   - 添加: duration, 删除: instanceId, taskId, nodeId, actionText

8. ❌ **TaskTransferDTO 参数不完整**
   - 添加: operatorName, targetUserName
   - 修改: comment → reason

9. ❌ **WorkflowConfigDTO 结构不同**
   - nodes, edges, approvers (从 formSchema/approvalRules)

10. ❌ **WorkflowCcVO 字段定义不同**
    - instanceNo, status: Integer (从 read: Boolean)
    - 删除: senderName

---

## 🔧 修复步骤

1. **更新 workflow-front/src/lib/api.ts**
   - 更新所有 VO/DTO 接口定义
   - 更新 API 端点的参数类型和返回类型
   - 修复参数名称映射

2. **更新 workflow-front/src/lib/apiService.ts**
   - 修复参数映射逻辑
   - 调整数据转换

3. **更新 workflow-front/src/lib/mock.ts**
   - 调整 Mock 数据结构以匹配后端

4. **更新前端组件**
   - WorkflowList.tsx
   - TaskList.tsx
   - InstanceList.tsx
   - Dashboard.tsx
   - 其他相关组件

---

## 📊 统计

- 总 API 端点数: 15+
- 完全一致: 3 个
- 需要修复: 12+ 个
- 不匹配的字段: 40+ 个

