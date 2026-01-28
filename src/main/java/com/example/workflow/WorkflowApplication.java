package com.example.workflow;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 工作流系统启动类
 * Spring Boot 3.x + H2数据库
 */
@SpringBootApplication
@MapperScan("com.example.workflow.mapper")
public class WorkflowApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(WorkflowApplication.class, args);
        System.out.println("========================================");
        System.out.println("工作流系统启动成功！");
        System.out.println("Swagger文档地址: http://localhost:8080/swagger-ui.html");
        System.out.println("H2控制台地址: http://localhost:8080/h2-console");
        System.out.println("  JDBC URL: jdbc:h2:mem:workflow_db");
        System.out.println("  User: sa");
        System.out.println("  Password: (留空)");
        System.out.println("========================================");
    }
}
