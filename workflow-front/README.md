# 工作流审批系统前端

基于 React + shadcn/ui 构建的企业级工作流审批系统前端项目。

## 功能特性

- 🏠 **仪表板** - 系统概览、统计数据和快速操作
- 📋 **流程管理** - 创建工作流定义、管理流程模板和配置
- 📝 **待办任务** - 处理待审批任务、转交任务
- 📊 **流程查询** - 查看和管理发起的流程实例
- 📨 **抄送管理** - 查看抄送信息和标记已读
- 🎨 **现代化UI** - 使用 shadcn/ui 组件库
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **UI组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS
- **类型检查**: TypeScript
- **图标**: Lucide React
- **HTTP客户端**: Axios
- **状态管理**: React Hooks (useState, useEffect)

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── ui/              # 基础UI组件 (shadcn/ui)
│   ├── layout/          # 布局组件 (Header等)
│   ├── auth/            # 认证相关组件
│   ├── dashboard/       # 仪表板组件
│   ├── workflow/        # 工作流管理组件
│   ├── task/           # 任务管理组件
│   └── instance/       # 流程实例组件
├── lib/                # 工具函数和API
│   ├── api.ts          # API接口定义
│   ├── apiService.ts   # API服务封装
│   ├── auth.ts         # 认证相关
│   └── utils.ts        # 工具函数
├── App.tsx            # 主应用组件
└── main.tsx          # 应用入口
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，将 `dist` 目录下的文件部署到静态文件服务器即可。

## 后端接口对接

前端项目需要与后端工作流系统配合使用，后端基于 Spring Boot 提供完整的 RESTful API。

### API 基础配置

- **基础URL**: `/api`
- **请求格式**: JSON
- **响应格式**: 统一响应体 `{ code, message, data }`

### 主要接口模块

#### 1. 工作流定义管理 (`/api/workflow`)

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 获取流程定义列表 | GET | `/workflow/definition` | 分页查询流程定义 |
| 获取工作流详情 | GET | `/workflow/definition/{id}` | 获取单个流程详情 |
| 创建工作流定义 | POST | `/workflow/definition` | 创建新流程定义 |
| 更新工作流定义 | PUT | `/workflow/definition/{id}` | 更新流程定义 |
| 删除工作流定义 | DELETE | `/workflow/definition/{id}` | 删除流程定义 |
| 发布工作流 | POST | `/workflow/definition/{id}/publish` | 发布流程 |
| 保存工作流配置 | POST | `/workflow/definition/{id}/config` | 保存流程配置 |

#### 2. 流程实例管理 (`/api/workflow`)

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 启动工作流 | POST | `/workflow/instance/start` | 启动新的流程实例 |
| 撤销流程 | POST | `/workflow/instance/{instanceId}/cancel` | 撤销流程实例 |
| 获取我发起的流程 | GET | `/workflow/instance/my` | 分页查询用户发起的流程 |
| 获取流程实例详情 | GET | `/workflow/instance/{instanceId}` | 获取流程实例详情 |
| 获取流程审批历史 | GET | `/workflow/instance/{instanceId}/history` | 获取流程审批历史 |

#### 3. 任务管理 (`/api/workflow`)

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 获取我的待办任务 | GET | `/workflow/task/pending` | 分页查询用户待办任务 |
| 审批任务 | POST | `/workflow/task/{taskId}/approve` | 审批任务（同意/驳回） |
| 转交任务 | POST | `/workflow/task/{taskId}/transfer` | 将任务转交给其他用户 |

#### 4. 抄送管理 (`/api/workflow/cc`)

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 获取我的抄送 | GET | `/workflow/cc/my` | 分页查询用户抄送信息 |
| 标记为已读 | POST | `/workflow/cc/{id}/read` | 标记抄送为已读状态 |

### 数据模型

主要的数据模型包括：

- `WorkflowDefinition` - 流程定义
- `WorkflowInstance` - 流程实例
- `WorkflowTask` - 任务
- `WorkflowHistory` - 审批历史
- `InstanceDetailVO` - 实例详情视图对象
- `WorkflowCcVO` - 抄送视图对象

## 开发说明

### 添加新的 shadcn/ui 组件

```bash
npx shadcn@latest add [component-name]
```

### 项目配置

- **TypeScript 配置**: `tsconfig.json` 和 `tsconfig.app.json`
- **Vite 配置**: `vite.config.ts`
- **Tailwind CSS 配置**: `tailwind.config.js`
- **shadcn/ui 配置**: `components.json`
- **PostCSS 配置**: `postcss.config.js`

### 样式规范

- 使用 Tailwind CSS 进行样式设计
- 遵循 shadcn/ui 的设计规范
- 保持组件的一致性和可复用性
- 支持响应式设计

### API 调用规范

所有 API 调用通过 `src/lib/apiService.ts` 中的服务类进行封装：

```typescript
import { apiService } from '@/lib/apiService'

// 获取流程列表
const response = await apiService.workflow.getDefinitions({
  pageNum: 1,
  pageSize: 10
})

// 处理任务
await apiService.task.approveTask(taskId, {
  userId: currentUser.id,
  action: 'APPROVE',
  comment: '审批通过'
})
```

## 部署说明

### 开发环境

1. 确保后端服务已启动
2. 运行 `npm run dev`
3. 访问 http://localhost:5173

### 生产环境

1. 运行 `npm run build`
2. 将 `dist` 目录部署到静态文件服务器
3. 配置代理或反向代理指向后端 API 服务

## 许可证

MIT License