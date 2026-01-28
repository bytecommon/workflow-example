# 工作流系统 - 快速开始指南 (H2版本)

## 🎯 前置要求

- **JDK 17** 或更高版本 (Spring Boot 3.x要求)
- **Maven 3.6+** 或更高版本
- **IDE** (推荐 IntelliJ IDEA 或 Eclipse)

**无需安装MySQL** - 使用H2内存数据库，开箱即用！

## 📦 快速启动（3步）

### 1. 创建项目并导入文件

创建标准Maven项目结构：

```
workflow-system/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── example/
│       │           └── workflow/
│       └── resources/
│           ├── application.yml
│           ├── schema.sql
│           └── data.sql
└── pom.xml
```

### 2. 放置文件

将下载的文件按包名放入对应目录：
- `WorkflowApplication.java` → `src/main/java/com/example/workflow/`
- Controller类 → `src/main/java/com/example/workflow/controller/`
- Service类 → `src/main/java/com/example/workflow/service/` 和 `service/impl/`
- 其他类依此类推
- `application.yml`, `schema.sql`, `data.sql` → `src/main/resources/`
- `pom.xml` → 项目根目录

### 3. 启动项目

**方式一：使用Maven**
```bash
mvn clean spring-boot:run
```

**方式二：使用IDE**
- 打开 `WorkflowApplication.java`
- 右键选择 "Run WorkflowApplication"

**方式三：打包运行**
```bash
mvn clean package
java -jar target/workflow-system-1.0.0.jar
```

## ✅ 验证启动

启动成功后，控制台会输出：

```
========================================
工作流系统启动成功！
Swagger文档地址: http://localhost:8080/swagger-ui.html
H2控制台地址: http://localhost:8080/h2-console
  JDBC URL: jdbc:h2:mem:workflow_db
  User: sa
  Password: (留空)
========================================
```

## 🔍 查看数据库

访问 **http://localhost:8080/h2-console**

连接信息：
- **JDBC URL**: `jdbc:h2:mem:workflow_db`
- **User Name**: `sa`
- **Password**: (留空)

点击 "Connect" 后可以看到已自动创建的10张表和测试数据。

## 📝 测试接口

访问 **http://localhost:8080/swagger-ui.html** 查看所有API接口

### 测试场景1: 查看工作流列表

在Swagger中找到 `workflow-controller`，展开查看接口

### 测试场景2: 查看已有的测试数据

#### 查看表单列表
```bash
GET http://localhost:8080/api/workflow/form/list?pageNum=1&pageSize=10
```

响应：会看到3个预置表单（请假、采购、报销）

#### 查看待办任务
```bash
GET http://localhost:8080/api/workflow/task/pending?userId=manager001&pageNum=1&pageSize=10
```

响应：张经理有1个待办任务（李四的采购申请）

#### 查看已完成流程
```bash
GET http://localhost:8080/api/workflow/instance/1
```

响应：可以看到张三的请假申请（已审批通过）

### 测试场景3: 启动新的请假流程

```bash
POST http://localhost:8080/api/workflow/instance/start
Content-Type: application/json

{
  "workflowId": 1,
  "startUserId": "user001",
  "startUserName": "张三",
  "title": "张三的病假申请",
  "formData": "{\"leaveType\":\"病假\",\"days\":2,\"startDate\":\"2024-01-20\",\"endDate\":\"2024-01-21\",\"reason\":\"身体不适\"}",
  "priority": 0
}
```

### 测试场景4: 审批任务

先查询待办任务获取taskId，然后：

```bash
POST http://localhost:8080/api/workflow/task/{taskId}/approve
Content-Type: application/json

{
  "approved": true,
  "operatorId": "manager001",
  "operatorName": "张经理",
  "comment": "同意",
  "attachments": null
}
```

### 测试场景5: 查看流程历史

```bash
GET http://localhost:8080/api/workflow/instance/{instanceId}/history
```

可以看到完整的审批记录。

## 📊 预置测试数据

系统启动时已自动导入以下测试数据：

### 用户角色
```
user001    - 张三（普通员工）
user002    - 李四（普通员工）
manager001 - 张经理（部门主管）
hr001      - 李总监（人事经理）
finance001 - 王财务（财务经理）
ceo001     - 赵总（总经理）
```

### 工作流
1. **请假审批**（ID:1）
   - 开始 → 部门主管 → 人事经理 → 结束

2. **采购审批**（ID:2）
   - 开始 → 部门主管 → 条件判断 → 财务/总经理 → 结束
   - 小于10000元走财务经理，大于等于10000元走总经理

3. **报销审批**（ID:3）
   - 开始 → 部门主管 → 财务审批 → 结束

### 流程实例
- **已完成**: 张三的请假申请（instance_id=1）
- **运行中**: 李四的采购申请（instance_id=2）

## 🎨 使用Swagger测试完整流程

### 1. 创建新表单
```
POST /api/workflow/form
{
  "formKey": "overtime_form",
  "formName": "加班申请表",
  "formDesc": "员工加班申请",
  "formConfig": "{\"fields\":[{\"name\":\"date\",\"label\":\"加班日期\",\"type\":\"date\"},{\"name\":\"hours\",\"label\":\"加班小时数\",\"type\":\"number\"}]}"
}
```

### 2. 创建工作流定义
```
POST /api/workflow/definition
{
  "workflowKey": "overtime_approval",
  "workflowName": "加班审批",
  "workflowDesc": "员工加班审批流程",
  "category": "人事管理",
  "formId": 4
}
```

### 3. 配置节点和审批人
```
POST /api/workflow/definition/{id}/config
{
  "nodes": [...],
  "edges": [...],
  "approvers": [...]
}
```

### 4. 发布工作流
```
POST /api/workflow/definition/{id}/publish
```

### 5. 启动流程
```
POST /api/workflow/instance/start
```

## 🔧 常见问题

### 1. 启动报错：找不到主类

**原因**: 文件没有按包名正确放置

**解决**: 确保 `WorkflowApplication.java` 在 `src/main/java/com/example/workflow/` 目录

### 2. 编译错误：程序包不存在

**原因**: Maven依赖未下载

**解决**: 
```bash
mvn clean install
```

### 3. 启动后无法访问Swagger

**原因**: 可能是端口被占用

**解决**: 修改 `application.yml` 中的端口
```yaml
server:
  port: 8081  # 改为其他端口
```

### 4. H2控制台连接失败

**确认配置**:
- JDBC URL必须是: `jdbc:h2:mem:workflow_db`
- 用户名: `sa`
- 密码: 留空（不填）

### 5. JDK版本问题

Spring Boot 3.x 要求JDK 17+

**检查版本**:
```bash
java -version
```

**下载JDK 17**:
- [Oracle JDK](https://www.oracle.com/java/technologies/downloads/#java17)
- [OpenJDK](https://adoptium.net/)

## 📚 下一步

### 学习路径
1. ✅ 快速启动（本文档）
2. 📖 阅读 `README.md` - 了解系统架构
3. 📖 阅读 `PROJECT_STRUCTURE.md` - 了解项目结构
4. 📖 阅读 `UPGRADE_GUIDE.md` - 了解技术选型
5. 🧪 使用Swagger测试所有API
6. 🔍 在H2控制台查看数据变化
7. 💻 修改代码，添加自己的功能

### 扩展功能
- 添加新的工作流类型
- 集成用户认证系统
- 实现更复杂的条件分支
- 添加消息通知功能
- 集成邮件发送
- 开发前端界面

## 🎓 学习资源

- [Spring Boot 3.x官方文档](https://spring.io/projects/spring-boot)
- [MyBatis-Plus官方文档](https://baomidou.com/)
- [H2 Database教程](https://www.h2database.com/html/tutorial.html)
- [Swagger/OpenAPI规范](https://swagger.io/specification/)

## 💡 提示

### 开发模式
H2内存数据库非常适合开发和学习：
- ✅ 启动快速
- ✅ 无需配置
- ✅ 数据隔离（重启重置）
- ✅ 可视化管理

### 生产环境
如需部署到生产环境，建议：
- 切换到MySQL/PostgreSQL
- 修改 `application.yml` 的数据源配置
- 执行 `workflow_schema.sql`（MySQL版本）
- 配置好数据库连接池
- 启用Redis缓存（可选）

## 🎉 开始使用吧！

现在你已经完全了解如何启动和使用这个工作流系统了。

祝你使用愉快！如有问题，请参考其他文档或查看代码注释。
