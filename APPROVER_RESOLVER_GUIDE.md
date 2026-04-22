# 审批人解析器重构指南

## 📋 概述

本指南说明如何使用新的审批人解析器（Approver Resolver）系统，该系统采用策略模式（Strategy Pattern）和工厂模式（Factory Pattern）实现。

## 🏗️ 架构设计

### 核心组件

```
┌─────────────────────────────────────────────────┐
│         ApproverResolverService                 │
│  (高层服务接口 - 业务层直接使用)                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│       ApproverResolverFactory                   │
│  (工厂类 - 自动发现和选择Resolver)                │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────┐
    │            │            │          │
┌───▼──┐   ┌────▼───┐   ┌───▼──┐  ┌───▼──┐
│User  │   │RoleApp │   │Dept  │  │Leader│
│Resol.│   │resolver│   │Resol.│  │Resol.│
└──────┘   └────────┘   └──────┘  └──────┘
Priority:100  Priority:80  Priority:70  Priority:60
```

### 核心接口

```java
public interface ApproverResolver {
    // 检查是否支持该类型
    boolean supports(String approverType);
    
    // 解析审批人
    List<String> resolve(WorkflowApprover approver, Map<String, Object> contextData);
    
    // 获取优先级
    int getPriority();
}
```

## 📦 文件清单

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `ApproverResolver.java` | 核心接口 | - |
| `UserApproverResolver.java` | 用户类型 | 100 |
| `FormUserApproverResolver.java` | 表单用户 | 90 |
| `RoleApproverResolver.java` | 角色类型 | 80 |
| `DeptApproverResolver.java` | 部门类型 | 70 |
| `LeaderApproverResolver.java` | 领导类型 | 60 |
| `ApproverResolverFactory.java` | 工厂类 | - |
| `ApproverResolverService.java` | 服务层 | - |

## 🚀 使用方法

### 方法 1：解析单个审批人

```java
@Service
public class WorkflowEngineServiceImpl {
    
    @Autowired
    private ApproverResolverService approverResolverService;
    
    public void processTask(WorkflowTask task) {
        // 获取审批人配置
        WorkflowApprover approver = getApprover(task.getNodeId());
        
        // 准备上下文
        Map<String, Object> contextData = new HashMap<>();
        contextData.put("formData", task.getFormData());
        contextData.put("variables", task.getVariables());
        contextData.put("currentUserId", getCurrentUserId());
        
        // 解析
        List<String> userIds = approverResolverService.resolveApprover(approver, contextData);
        
        // 为每个用户创建任务
        userIds.forEach(userId -> createTask(task, userId));
    }
}
```

### 方法 2：解析多个审批人（自动去重）

```java
public void createApproveTasks(WorkflowNode node, Map<String, Object> contextData) {
    List<WorkflowApprover> approvers = getNodeApprovers(node.getNodeId());
    
    // 自动去重和合并
    List<String> allApprovers = approverResolverService.resolveApprovers(approvers, contextData);
    
    allApprovers.forEach(userId -> createTask(node, userId));
}
```

### 方法 3：按类型和ID直接解析

```java
List<String> approvers = approverResolverService.resolveByTypeAndId(
    "USER", 
    "user123,user456", 
    contextData
);
```

### 方法 4：验证支持的类型

```java
// 检查某个类型是否支持
if (approverResolverService.isApproverTypeSupported("ROLE")) {
    // 支持
}

// 获取所有支持的类型
List<String> supportedTypes = approverResolverService.getSupportedApproverTypes();
// 返回: [USER, ROLE, DEPT, LEADER, FORM_USER]
```

## 📊 审批人类型说明

### 1. USER - 直接指定用户

```
配置示例：
- approverId: "user001,user002" 或 "user001"
- 支持多个用户用逗号分隔
- 优先级：100（最高）
```

### 2. FORM_USER - 从表单字段读取

```
配置示例：
- approverId: "approverField" （表单中的字段名）
- 从 contextData["formData"]["approverField"] 读取用户ID
- 优先级：90
```

### 3. ROLE - 按角色查询用户

```
配置示例：
- approverId: "manager" （角色ID）
- 需要实现：RoleApproverResolver.resolve() 中的用户查询逻辑
- 优先级：80
- 状态：需要实现（TODO）
```

### 4. DEPT - 按部门查询用户

```
配置示例：
- approverId: "dept001" （部门ID）
- 需要实现：DeptApproverResolver.resolve() 中的用户查询逻辑
- 优先级：70
- 状态：需要实现（TODO）
```

### 5. LEADER - 查询用户的领导

```
配置示例：
- approverId: "CURRENT_USER" 或 "user001"
- 查询指定用户的直属领导
- 需要实现：LeaderApproverResolver.resolve() 中的组织结构查询逻辑
- 优先级：60
- 状态：需要实现（TODO）
```

## 🔧 扩展新的审批人类型

### 步骤 1：创建新的Resolver类

```java
@Slf4j
@Component
public class CustomApproverResolver implements ApproverResolver {
    
    private static final String APPROVER_TYPE = "CUSTOM";
    private static final int PRIORITY = 50;  // 自定义优先级
    
    @Override
    public boolean supports(String approverType) {
        return APPROVER_TYPE.equals(approverType);
    }
    
    @Override
    public List<String> resolve(WorkflowApprover approver, Map<String, Object> contextData) {
        // 实现你的逻辑
        String customId = approver.getApproverId();
        // ... 解析逻辑 ...
        return userIds;
    }
    
    @Override
    public int getPriority() {
        return PRIORITY;
    }
}
```

### 步骤 2：自动注册

由于使用了 `@Component` 注解，Spring 会自动发现并注册该Resolver，无需其他配置。

### 步骤 3：使用

```java
List<String> users = approverResolverService.resolveByTypeAndId(
    "CUSTOM", 
    "customId123", 
    contextData
);
```

## 📝 需要实现的功能

以下三个Resolver 是 TODO 实现，需要连接到实际的系统：

### 1. RoleApproverResolver

需要实现的逻辑：
```java
// 在 resolve() 方法中添加：
List<String> userIds = userService.getUsersByRole(roleId);
return userIds;
```

**依赖：**
- UserService 或类似的用户管理服务
- 需要查询表：user_role 关联表或类似结构

### 2. DeptApproverResolver

需要实现的逻辑：
```java
// 在 resolve() 方法中添加：
List<String> userIds = userService.getUsersByDept(deptId);
return userIds;
```

**依赖：**
- UserService 或用户管理服务
- 需要查询表：user_dept 关联表或类似结构

### 3. LeaderApproverResolver

需要实现的逻辑：
```java
// 在 resolve() 方法中添加：
String leaderId = orgService.getUserLeader(targetUserId);
if (leaderId != null) {
    leaderIds.add(leaderId);
}
return leaderIds;
```

**依赖：**
- OrgService 或组织结构服务
- 需要查询表：user_leader 或类似结构

## 🔍 上下文数据（contextData）

解析器可以访问以下上下文信息：

```java
Map<String, Object> contextData = new HashMap<>();

// 表单数据（如有）
contextData.put("formData", formData);

// 流程变量
contextData.put("variables", processVariables);

// 当前用户ID
contextData.put("currentUserId", "user001");

// 其他相关信息
contextData.put("instanceId", instanceId);
contextData.put("nodeId", nodeId);
```

## ⚠️ 错误处理

所有Resolver会抛出 `WorkflowEngineException`：

```java
try {
    List<String> approvers = approverResolverService.resolveApprover(approver, contextData);
} catch (WorkflowEngineException e) {
    log.error("Failed to resolve approver", e);
    // 处理错误
}
```

常见错误：
- "Approver type cannot be null or empty" - 审批人类型未指定
- "No resolver found for approver type: XXX" - 不支持的审批人类型
- "Role ID cannot be empty for ROLE approver" - 角色ID为空
- "Form data not found in context" - 表单数据未在上下文中

## 🧪 测试示例

```java
@Test
public void testUserApproverResolver() {
    WorkflowApprover approver = new WorkflowApprover();
    approver.setApproverType("USER");
    approver.setApproverId("user001,user002");
    
    Map<String, Object> contextData = new HashMap<>();
    
    List<String> result = approverResolverService.resolveApprover(approver, contextData);
    
    assertEquals(2, result.size());
    assertTrue(result.contains("user001"));
    assertTrue(result.contains("user002"));
}

@Test
public void testFormUserApproverResolver() {
    WorkflowApprover approver = new WorkflowApprover();
    approver.setApproverType("FORM_USER");
    approver.setApproverId("managerField");
    
    Map<String, Object> contextData = new HashMap<>();
    Map<String, Object> formData = new HashMap<>();
    formData.put("managerField", "manager001");
    contextData.put("formData", formData);
    
    List<String> result = approverResolverService.resolveApprover(approver, contextData);
    
    assertEquals(1, result.size());
    assertEquals("manager001", result.get(0));
}
```

## 📚 集成到现有代码

### 原来的代码（混乱的审批人解析）

```java
// WorkflowEngineServiceImpl.java - 旧方式（不推荐）
private List<String> resolveApprovers(WorkflowApprover approver) {
    if ("USER".equals(approver.getApproverType())) {
        return Arrays.asList(approver.getApproverId().split(","));
    } else if ("ROLE".equals(approver.getApproverType())) {
        // 角色查询逻辑混在这里
        // ...
    } else if ("FORM_USER".equals(approver.getApproverType())) {
        // 表单字段解析混在这里
        // ...
    }
    // ...其他类型...
}
```

### 改进后的代码（推荐）

```java
// WorkflowEngineServiceImpl.java - 新方式（推荐）
@Autowired
private ApproverResolverService approverResolverService;

private List<String> resolveApprovers(List<WorkflowApprover> approvers, Map<String, Object> contextData) {
    return approverResolverService.resolveApprovers(approvers, contextData);
}
```

## ✅ 优势总结

| 优势 | 说明 |
|------|------|
| **低耦合** | 审批人解析逻辑与核心引擎分离 |
| **高内聚** | 每个Resolver只处理一种类型 |
| **易扩展** | 新增类型只需添加新的Resolver类 |
| **易测试** | 每个Resolver可独立单元测试 |
| **优先级管理** | 支持自定义Resolver优先级 |
| **自动注册** | Spring自动发现所有Resolver实现 |
| **上下文灵活** | 支持传递任意上下文数据 |

---

**创建日期：** 2026-04-22  
**作者：** bytecommon  
**版本：** 1.0