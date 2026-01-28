# 后台接口与前端代码匹配分析报告

## 📊 概览

本项目为前端单体应用（Vite + React + TypeScript），包含：
- **API 定义**: `src/lib/api.ts` - 接口类型和端点定义
- **API 服务**: `src/lib/apiService.ts` - 上层 API 包装器
- **Mock 实现**: `src/lib/mock.ts` - 开发时模拟数据

> ⚠️ **重要**: 本仓库不包含后端实现代码。所有接口都对接外部后端服务（`/api` 基础路径）。

---

## 🎯 前端定义的 API 端点

### 流程定义（Workflow Definition）
```
GET    /workflow/definition              → getDefinitions()
GET    /workflow/definition/:id          → getWorkflowDetail(id)
POST   /workflow/definition              → createDefinition(data)
PUT    /workflow/definition/:id          → updateDefinition(id, data)
DELETE /workflow/definition/:id          → deleteDefinition(id)
POST   /workflow/definition/:id/publish  → publishWorkflow(id)
POST   /workflow/definition/:id/config   → saveConfig(id, config)
```

### 流程实例（Workflow Instance）
```
GET    /workflow/instance/my                      → getMyInstances(params)
GET    /workflow/instance/:instanceId             → getInstanceDetail(instanceId)
POST   /workflow/instance/start                   → startInstance(data)
POST   /workflow/instance/:instanceId/cancel      → cancelInstance(instanceId, reason)
GET    /workflow/instance/:instanceId/history    → getInstanceHistory(instanceId)
```

### 任务（Task）
```
GET    /workflow/task/pending              → getPendingTasks(params)
POST   /workflow/task/:taskId/approve      → approveTask(taskId, data)
POST   /workflow/task/:taskId/transfer     → transferTask(taskId, data)
```

### 抄送（CC）
```
GET    /workflow/cc/my           → getMyCc(params)
POST   /workflow/cc/:id/read     → markAsRead(id)
```

---

## ✅ 已发现并修复的不匹配问题

### 1️⃣ getWorkflowDetail Mock 返回数据结构错误 [已修复]

**问题**: Mock 返回整个定义列表，而不是单个定义对象
```typescript
// ❌ 修复前
async getWorkflowDetail(id: number) {
  if (useMock) {
    return mockApi.getWorkflowDefinitions()  // 返回数组！
  }
}
```

**修复**: 添加 `getWorkflowDetail()` Mock 方法并返回正确的对象结构
```typescript
// ✅ 修复后
async getWorkflowDetail(id: number) {
  if (useMock) {
    return mockApi.getWorkflowDetail(id)  // 返回单个对象
  }
}
```

---

### 2️⃣ getDefinitions 参数名不匹配 [已修复]

**问题**: 参数命名不一致导致搜索功能失效

| 位置 | 参数名 | 问题 |
|------|--------|------|
| apiService | `name?: string` | 前端定义 |
| workflowApi | `workflowName?: string` | 后端期望 |

**修复**: 统一参数名为 `workflowName`
```typescript
// ✅ 修复后
async getDefinitions(params?: {
  pageNum?: number
  pageSize?: number
  workflowName?: string      // 🔄 已修改
  status?: number
  category?: string
})
```

---

### 3️⃣ Mock 分页数据结构不一致 [已修复]

**问题**: Mock 数据返回数组，但实际应该返回分页对象 `Page<T>`

```typescript
// ❌ 修复前
async getWorkflowDefinitions() {
  await this.delay()
  return {
    code: 200,
    message: '成功',
    data: mockData.generateWorkflowDefinitions()  // 数组
  }
}

// ✅ 修复后
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
}
```

**影响的方法**:
- `getWorkflowDefinitions()` ✅
- `getPendingTasks()` ✅
- `getMyInstances()` ✅

---

### 4️⃣ instanceId 类型不一致 [已修复]

**问题**: 参数类型定义为 `number`，但实际数据为 `string`

```typescript
// ❌ 修复前
async getInstanceDetail(instanceId: number) { ... }

// ✅ 修复后
async getInstanceDetail(instanceId: string | number) { ... }
```

**对应数据示例**:
```typescript
instanceId: 'INST_20240115001'  // 实际是字符串
```

---

## 📋 前端调用点检查

### WorkflowList.tsx
```typescript
await apiService.workflow.getDefinitions({ 
  pageNum: 1, 
  workflowName: '...'  // ✅ 现已修复参数名
})
```

### TaskList.tsx
```typescript
await apiService.task.getPendingTasks({ 
  userId: currentUser.id,
  pageNum: 1
})  // ✅ 分页结构现已正确
```

### InstanceList.tsx
```typescript
await apiService.instance.getMyInstances({ 
  userId: currentUser.id 
})  // ✅ 分页结构现已正确
```

---

## 🔍 参数对应关系

### WorkflowDefinition 类型映射

| 前端字段 | 后端字段 | 说明 |
|---------|---------|------|
| `id` | `id` | 流程定义ID |
| `workflowKey` | `workflowKey` | 流程标识符 |
| `workflowName` | `workflowName` | 流程名称 |
| `version` | `version` | 版本号 |
| `workflowDesc` | `workflowDesc` | 流程描述 |
| `status` | `status` | 状态（0=草稿, 1=已发布） |

### WorkflowInstance 类型映射

| 前端字段 | 后端字段 | 说明 |
|---------|---------|------|
| `instanceId` | `instanceId` | 实例ID（字符串格式：INST_xxx） |
| `status` | `status` | 状态（1=运行中, 2=已完成, 3=已终止） |
| `starterUserId` | `starterUserId` | 发起人ID |

---

## ✨ 修复总结

| 问题 | 文件 | 修复状态 | 影响范围 |
|------|------|--------|---------|
| getWorkflowDetail Mock 返回 | `apiService.ts`, `mock.ts` | ✅ 已修复 | 工作流详情页面 |
| 参数名不匹配 | `apiService.ts` | ✅ 已修复 | 流程搜索功能 |
| 分页数据结构 | `mock.ts` | ✅ 已修复 | Mock 模式下的分页功能 |
| instanceId 类型 | `apiService.ts`, `mock.ts` | ✅ 已修复 | 实例详情页面 |

---

## 🚀 建议

### 与后端团队确认的事项

1. **确认 API 返回格式**
   ```typescript
   // 确认后端是否返回以下格式
   {
     "code": 200,
     "message": "成功",
     "data": {
       "records": [...],
       "total": 100,
       "size": 10,
       "current": 1,
       "pages": 10
     }
   }
   ```

2. **确认参数类型**
   - `instanceId` 是否为字符串格式 (`INST_xxx`) 或数字？
   - URL 路由中如何处理？

3. **错误处理**
   - 确认后端的错误响应格式
   - 验证 HTTP 状态码与 `response.code` 的对应关系

### 前端改进建议

1. ✅ 添加类型严格检查（已通过修复实现）
2. 添加单元测试验证 Mock 与真实 API 返回结构一致
3. 在 CI 中添加接口健康检查
4. 完善错误处理，区分网络错误和业务错误

---

## 📞 需要进一步对齐的信息

如果后端在不同的仓库中，请获取以下信息进行对齐：

- 后端 API 文档（Swagger/OpenAPI）
- 实际的分页返回结构
- 错误响应格式
- 验证所有 HTTP 方法和状态码

---

**报告生成时间**: 2024年  
**分析工具**: API 接口匹配分析工具
