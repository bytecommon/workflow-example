# 工作流系统 - 完整后端实现

基于 Spring Boot 3.2.0 + MyBatis-Plus + H2 构建的完整工作流系统后端项目。

## 功能特性

- 🏗️ **工作流定义管理** - 创建、更新、删除工作流定义
- ⚙️ **流程配置** - 节点配置、连线配置、审批人配置
- 🚀 **流程启动** - 启动工作流实例
- ✅ **任务审批** - 审批、转交、撤销任务
- 📊 **流程查询** - 分页查询流程定义、实例、任务
- 📝 **表单管理** - 自定义表单配置
- 📋 **抄送功能** - 流程抄送记录管理
- 📈 **统计查询** - 用户和工作流维度统计
- 🎯 **现代化架构** - Spring Boot 3.2 + MyBatis-Plus
- 📱 **开箱即用** - H2内存数据库，无需外部依赖

## 技术栈

- **后端框架**: Spring Boot 3.2.0
- **数据访问**: MyBatis-Plus 3.5.5
- **数据库**: H2 Database (内存数据库)
- **API文档**: SpringDoc OpenAPI 2.3.0
- **构建工具**: Maven 3.6+
- **JDK版本**: 17+
- **依赖管理**: Spring Boot Starter

## 核心功能模块

### 1. 工作流定义管理
- 创建工作流定义（支持名称、分类、描述等）
- 更新工作流定义信息
- 删除工作流定义（检查运行中实例）
- 发布工作流（验证配置完整性）
- 分页查询工作流定义（支持按名称、分类、状态查询）

### 2. 流程配置管理
- 节点配置（开始、审批、抄送、条件、结束节点）
- 连线配置（节点流转关系）
- 审批人配置（用户、角色、部门、上级领导等）
- 保存完整工作流配置

### 3. 流程实例管理
- 启动工作流实例
- 获取流程实例详情
- 撤销流程实例
- 获取流程审批历史
- 分页查询我发起的流程

### 4. 任务管理
- 获取我的待办任务（分页查询）
- 审批任务（同意/拒绝）
- 转交任务给其他用户
- 任务状态管理

### 5. 表单管理
- 创建自定义表单
- 更新表单配置
- 删除表单
- 获取表单列表和详情

### 6. 统计查询
- 用户维度统计（待办数、已办数等）
- 工作流维度统计（总流程数、通过率等）

### 7. 抄送管理
- 获取我的抄送记录
- 标记抄送为已读

## 项目结构

```
src/main/java/com/example/workflow/
├── controller/           # 控制层
│   ├── WorkflowController.java          # 工作流核心控制器
│   ├── WorkflowFormController.java      # 表单管理控制器
│   ├── WorkflowStatisticsController.java # 统计查询控制器
│   └── WorkflowCcController.java         # 抄送查询控制器
├── service/             # 服务层
│   ├── WorkflowService.java            # 工作流服务接口
│   ├── WorkflowEngineService.java      # 工作流引擎接口
│   ├── WorkflowFormService.java        # 表单服务接口
│   ├── WorkflowStatisticsService.java  # 统计服务接口
│   ├── WorkflowCcService.java          # 抄送服务接口
│   └── impl/            # 服务实现
│       ├── WorkflowServiceImpl.java
│       ├── WorkflowEngineServiceImpl.java
│       ├── WorkflowFormServiceImpl.java
│       ├── WorkflowStatisticsServiceImpl.java
│       └── WorkflowCcServiceImpl.java
├── mapper/              # 数据访问层
│   ├── WorkflowDefinitionMapper.java
│   ├── WorkflowNodeMapper.java
│   ├── WorkflowEdgeMapper.java
│   ├── WorkflowApproverMapper.java
│   ├── WorkflowInstanceMapper.java
│   ├── WorkflowTaskMapper.java
│   ├── WorkflowHistoryMapper.java
│   ├── WorkflowCcMapper.java
│   ├── WorkflowVariableMapper.java
│   └── WorkflowFormMapper.java
├── entity/              # 实体类
│   ├── WorkflowDefinition.java
│   ├── WorkflowNode.java
│   ├── WorkflowEdge.java
│   ├── WorkflowApprover.java
│   ├── WorkflowForm.java
│   ├── WorkflowInstance.java
│   ├── WorkflowTask.java
│   ├── WorkflowHistory.java
│   ├── WorkflowCc.java
│   └── WorkflowVariable.java
├── dto/                 # 数据传输对象
│   ├── WorkflowDefinitionDTO.java
│   ├── WorkflowDefinitionQueryDTO.java
│   ├── WorkflowConfigDTO.java
│   ├── WorkflowStartDTO.java
│   ├── TaskApproveDTO.java
│   ├── TaskTransferDTO.java
│   ├── TaskQueryDTO.java
│   ├── InstanceQueryDTO.java
│   └── WorkflowFormDTO.java
├── vo/                  # 视图对象
│   ├── Result.java
│   ├── WorkflowDetailVO.java
│   ├── WorkflowDefinitionVO.java
│   ├── TaskVO.java
│   ├── InstanceVO.java
│   ├── InstanceDetailVO.java
│   ├── HistoryVO.java
│   ├── WorkflowFormVO.java
│   ├── WorkflowStatisticsVO.java
│   └── WorkflowCcVO.java
├── enums/               # 枚举类
│   ├── NodeType.java
│   ├── InstanceStatus.java
│   ├── TaskStatus.java
│   ├── ApproverType.java
│   └── ApproveMode.java
└── config/              # 配置类
    ├── MybatisPlusConfig.java
    ├── MyMetaObjectHandler.java
    ├── CorsConfig.java
    ├── SwaggerConfig.java
    └── GlobalExceptionHandler.java
```

## API接口清单

### 工作流定义管理
- `POST /api/workflow/definition` - 创建工作流定义
- `PUT /api/workflow/definition/{id}` - 更新工作流定义
- `DELETE /api/workflow/definition/{id}` - 删除工作流定义
- `POST /api/workflow/definition/{id}/publish` - 发布工作流
- `GET /api/workflow/definition/{id}` - 获取工作流详情
- `GET /api/workflow/definition` - 分页查询工作流定义
- `POST /api/workflow/definition/{id}/config` - 保存工作流配置

### 流程实例管理
- `POST /api/workflow/instance/start` - 启动工作流
- `GET /api/workflow/instance/{instanceId}` - 获取流程实例详情
- `POST /api/workflow/instance/{instanceId}/cancel` - 撤销流程
- `GET /api/workflow/instance/{instanceId}/history` - 获取流程审批历史
- `GET /api/workflow/instance/my` - 获取我发起的流程（分页）

### 任务管理
- `GET /api/workflow/task/pending` - 获取我的待办任务（分页）
- `POST /api/workflow/task/{taskId}/approve` - 审批任务
- `POST /api/workflow/task/{taskId}/transfer` - 转交任务

### 表单管理
- `POST /api/workflow/form` - 创建表单
- `PUT /api/workflow/form/{id}` - 更新表单
- `DELETE /api/workflow/form/{id}` - 删除表单
- `GET /api/workflow/form/{id}` - 获取表单详情
- `GET /api/workflow/form/list` - 获取表单列表

### 统计查询
- `GET /api/workflow/statistics/user/{userId}` - 获取用户统计
- `GET /api/workflow/statistics/workflow/{workflowId}` - 获取工作流统计

### 抄送管理
- `GET /api/workflow/cc/my` - 获取我的抄送
- `POST /api/workflow/cc/{id}/read` - 标记为已读

## 安装和运行

### 前置要求
- JDK 17 或更高版本
- Maven 3.6 或更高版本

### 启动步骤

1. **构建项目**
```bash
mvn clean install
```

2. **运行项目**
```bash
mvn spring-boot:run
```

3. **访问应用**
- **Swagger文档**: http://localhost:8080/swagger-ui.html
- **H2控制台**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:workflow_db`
  - User: `sa`
  - Password: (留空)

## 测试数据

系统启动时自动创建以下测试数据：

### 工作流定义
1. **请假审批** - 开始 → 部门主管 → 人事经理 → 结束
2. **采购审批** - 开始 → 部门主管 → 条件判断 → 财务/总经理 → 结束
3. **报销审批** - 开始 → 部门主管 → 财务审批 → 结束

### 测试用户
- user001 - 张三（普通员工）
- user002 - 李四（普通员工）
- manager001 - 张经理（部门主管）
- hr001 - 李总监（人事经理）
- finance001 - 王财务（财务经理）
- ceo001 - 赵总（总经理）

### 流程实例
- 已完成流程：张三的请假申请
- 运行中流程：李四的采购申请

## 技术特点

### 1. 工作流引擎
- 支持多种节点类型（开始、审批、抄送、条件、结束）
- 支持多种审批模式（会签、或签、依次审批）
- 支持条件分支流转
- 完整的流程历史记录

### 2. 数据设计
- 10张表完整覆盖工作流需求
- 支持自定义表单配置
- 完整的审批历史追溯
- 支持流程变量存储

### 3. 开发友好
- 使用H2内存数据库，开箱即用
- 丰富的测试数据，立即体验
- 完整的API文档（Swagger）
- 标准的分页查询接口

### 4. 扩展性强
- 模块化设计，易于扩展
- 清晰的接口定义
- 标准的异常处理机制

## 部署到生产环境

如需部署到生产环境，建议：

1. **切换数据库** - 从H2切换到MySQL或PostgreSQL
2. **修改配置** - 更新 `application.yml` 中的数据源配置
3. **执行SQL** - 执行 `schema.sql` 创建生产环境表结构
4. **配置缓存** - 可选集成Redis缓存
5. **安全配置** - 添加用户认证和授权机制

## 许可证

MIT License