# 工作流系统 - 文件清单与项目结构

## 📁 项目结构

```
workflow-example/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── workflow/
│       │           ├── WorkflowApplication.java                 # 启动类
│       │           ├── controller/                             # 控制层
│       │           │   ├── WorkflowController.java            # 工作流控制器
│       │           │   ├── WorkflowFormController.java        # 表单控制器
│       │           │   ├── WorkflowStatisticsController.java  # 统计控制器
│       │           │   └── WorkflowCcController.java          # 抄送控制器
│       │           ├── service/                               # 服务层接口
│       │           │   ├── WorkflowService.java              # 工作流服务
│       │           │   ├── WorkflowEngineService.java        # 工作流引擎
│       │           │   ├── WorkflowFormService.java          # 表单服务
│       │           │   ├── WorkflowStatisticsService.java    # 统计服务
│       │           │   ├── WorkflowCcService.java            # 抄送服务
│       │           │   └── impl/                             # 服务实现
│       │           │       ├── WorkflowServiceImpl.java
│       │           │       ├── WorkflowEngineServiceImpl.java
│       │           │       ├── WorkflowFormServiceImpl.java
│       │           │       ├── WorkflowStatisticsServiceImpl.java
│       │           │       └── WorkflowCcServiceImpl.java
│       │           ├── mapper/                                # 数据访问层
│       │           │   ├── WorkflowDefinitionMapper.java
│       │           │   ├── WorkflowNodeMapper.java
│       │           │   ├── WorkflowEdgeMapper.java
│       │           │   ├── WorkflowApproverMapper.java
│       │           │   ├── WorkflowInstanceMapper.java
│       │           │   ├── WorkflowTaskMapper.java
│       │           │   ├── WorkflowHistoryMapper.java
│       │           │   ├── WorkflowCcMapper.java
│       │           │   ├── WorkflowVariableMapper.java
│       │           │   └── WorkflowFormMapper.java
│       │           ├── entity/                                # 实体类
│       │           │   ├── WorkflowDefinition.java           # 工作流定义
│       │           │   ├── WorkflowNode.java                 # 工作流节点
│       │           │   ├── WorkflowEdge.java                 # 工作流连线
│       │           │   ├── WorkflowApprover.java             # 审批人配置
│       │           │   ├── WorkflowForm.java                 # 自定义表单
│       │           │   ├── WorkflowInstance.java             # 工作流实例
│       │           │   ├── WorkflowTask.java                 # 工作流任务
│       │           │   ├── WorkflowHistory.java              # 工作流历史
│       │           │   ├── WorkflowCc.java                   # 工作流抄送
│       │           │   └── WorkflowVariable.java             # 工作流变量
│       │           ├── dto/                                   # 数据传输对象
│       │           │   ├── WorkflowDefinitionDTO.java
│       │           │   ├── WorkflowConfigDTO.java
│       │           │   ├── WorkflowStartDTO.java
│       │           │   ├── TaskApproveDTO.java
│       │           │   ├── TaskTransferDTO.java
│       │           │   ├── TaskQueryDTO.java
│       │           │   ├── InstanceQueryDTO.java
│       │           │   └── WorkflowFormDTO.java
│       │           ├── vo/                                    # 视图对象
│       │           │   ├── Result.java                       # 统一返回结果
│       │           │   ├── WorkflowDetailVO.java
│       │           │   ├── TaskVO.java
│       │           │   ├── InstanceVO.java
│       │           │   ├── InstanceDetailVO.java
│       │           │   ├── HistoryVO.java
│       │           │   ├── WorkflowFormVO.java
│       │           │   ├── WorkflowStatisticsVO.java
│       │           │   └── WorkflowCcVO.java
│       │           ├── enums/                                 # 枚举类
│       │           │   ├── NodeType.java                     # 节点类型
│       │           │   ├── InstanceStatus.java               # 实例状态
│       │           │   ├── TaskStatus.java                   # 任务状态
│       │           │   ├── ApproverType.java                 # 审批人类型
│       │           │   └── ApproveMode.java                  # 审批模式
│       │           └── config/                                # 配置类
│       │               ├── MybatisPlusConfig.java            # MyBatis-Plus配置
│       │               ├── MyMetaObjectHandler.java          # 自动填充配置
│       │               ├── CorsConfig.java                   # 跨域配置
│       │               ├── SwaggerConfig.java                # Swagger配置
│       │               └── GlobalExceptionHandler.java       # 全局异常处理
│       └── resources/
│           ├── application.yml                                # 应用配置
│           └── mapper/                                        # MyBatis XML映射文件(可选)
├── pom.xml                                                    # Maven依赖配置
└── README.md                                                  # 项目说明文档

```

## 📋 文件说明

### 1. 启动类
- **WorkflowApplication.java**: Spring Boot应用启动入口

### 2. 控制层 (Controller)
- **WorkflowController.java**: 工作流核心接口（定义管理、实例管理、任务审批）
- **WorkflowFormController.java**: 自定义表单管理接口
- **WorkflowStatisticsController.java**: 统计查询接口
- **WorkflowCcController.java**: 抄送查询接口

### 3. 服务层 (Service)
#### 接口
- **WorkflowService.java**: 工作流核心业务接口
- **WorkflowEngineService.java**: 工作流引擎接口（流程流转核心）
- **WorkflowFormService.java**: 表单业务接口
- **WorkflowStatisticsService.java**: 统计业务接口
- **WorkflowCcService.java**: 抄送业务接口

#### 实现
- **WorkflowServiceImpl.java**: 工作流核心业务实现
- **WorkflowEngineServiceImpl.java**: 工作流引擎实现（包含流转逻辑）
- **WorkflowFormServiceImpl.java**: 表单业务实现
- **WorkflowStatisticsServiceImpl.java**: 统计业务实现
- **WorkflowCcServiceImpl.java**: 抄送业务实现

### 4. 数据访问层 (Mapper)
所有Mapper接口继承MyBatis-Plus的BaseMapper，提供基础CRUD功能

### 5. 实体类 (Entity)
对应数据库表的实体类，使用MyBatis-Plus注解

### 6. 数据传输对象 (DTO)
- 用于接收前端请求参数
- 包含数据校验注解

### 7. 视图对象 (VO)
- 用于返回给前端的数据
- 可能包含多表关联数据

### 8. 枚举类 (Enums)
- **NodeType**: START, APPROVE, CC, CONDITION, END
- **InstanceStatus**: RUNNING, APPROVED, REJECTED, CANCELED, TERMINATED
- **TaskStatus**: PENDING, APPROVED, REJECTED, TRANSFERRED, CANCELED
- **ApproverType**: USER, ROLE, DEPT, LEADER, SELF, FORM_USER
- **ApproveMode**: AND, OR, SEQUENCE

### 9. 配置类 (Config)
- **MybatisPlusConfig**: MyBatis-Plus分页插件配置
- **MyMetaObjectHandler**: 自动填充时间字段
- **CorsConfig**: 跨域配置
- **SwaggerConfig**: API文档配置
- **GlobalExceptionHandler**: 全局异常捕获和处理

### 10. 数据库脚本
- **workflow_schema.sql**: 完整的数据库表结构（10张表）

### 11. 配置文件
- **application.yml**: 应用配置（数据源、MyBatis-Plus、Swagger等）
- **pom.xml**: Maven依赖配置

## 🚀 核心功能模块

### 1. 工作流定义模块
- 创建、更新、删除工作流定义
- 节点配置（开始、审批、抄送、条件、结束）
- 连线配置（节点流转关系）
- 审批人配置（多种类型、多种模式）
- 分页查询工作流定义（支持按名称、分类、状态查询）
- 发布工作流（验证配置完整性）

### 2. 工作流引擎模块
- 流程启动
- 节点流转
- 任务创建
- 条件判断
- 审批模式处理（会签、或签、依次审批）

### 3. 任务管理模块
- 任务查询（待办、已办）
- 任务审批（同意、拒绝）
- 任务转交
- 任务撤销

### 4. 流程实例模块
- 实例启动
- 实例查询
- 实例撤销
- 实例历史追溯

### 5. 表单管理模块
- 表单创建
- 表单配置（JSON格式）
- 表单数据存储和查询

### 6. 统计查询模块
- 用户维度统计（待办数、已办数等）
- 工作流维度统计（总流程数、通过率等）

### 7. 抄送模块
- 抄送记录查询
- 标记已读

## 🔧 技术实现要点

### 1. 工作流引擎核心逻辑
- **节点流转**: 根据连线和条件计算下一个节点
- **任务创建**: 根据审批人配置生成任务
- **审批模式**:
  - 会签: 所有人同意才通过
  - 或签: 任意一人同意即可
  - 依次审批: 按顺序审批

### 2. 审批人解析
- 指定用户: 直接从配置中解析
- 角色/部门: 需要查询用户角色表
- 上级领导: 需要查询组织架构
- 发起人: 使用流程实例的发起人
- 表单字段: 从表单数据中解析

### 3. 条件表达式
- 支持SpEL表达式或自定义表达式
- 用于条件节点的分支判断

### 4. 事务处理
- 关键操作使用 @Transactional 保证数据一致性
- 流程流转、任务创建等操作在同一事务中

## 📝 后续扩展建议

1. **前端可视化编辑器**: 流程设计器、表单设计器
2. **高级功能**: 子流程、流程委托、流程回退
3. **消息通知**: 邮件、短信、APP推送
4. **权限控制**: 基于角色的权限管理
5. **流程监控**: 实时监控、超时提醒
6. **移动端**: 移动审批功能
7. **条件引擎**: 完善的条件表达式引擎
8. **流程测试**: 流程模拟和测试功能

## ⚠️ 注意事项

1. 需要实现用户认证和授权机制
2. WorkflowEngineServiceImpl中的审批人解析需要根据实际组织架构实现
3. 条件表达式求值需要集成表达式引擎（如SpEL、Aviator）
4. 建议增加缓存机制优化查询性能
5. 重要操作需要记录审计日志
