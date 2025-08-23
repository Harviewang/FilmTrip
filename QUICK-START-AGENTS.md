# 🚀 Cursor多Agent协作快速开始指南

## ⚡ 5分钟快速上手

### 1. 打开Cursor Chat
- 在Cursor中按 `Cmd+Shift+L` (macOS) 或 `Ctrl+Shift+L` (Windows/Linux)
- 或者点击左侧边栏的Chat图标

### 2. 开始多Agent协作
在Chat中输入以下内容来测试多Agent协作：

```
我需要开发一个照片管理功能，包括上传、预览、分类。
请各Agent协作完成这个功能的设计和实现。
```

### 3. 查看各Agent响应
每个Agent会根据其专长提供相应的建议和实现方案。

## 🎯 常用Agent调用方式

### 单独调用
```
@backend 请帮我优化这个API的性能
@frontend 这个组件需要支持移动端
@database 这个查询太慢了，请优化
@tester 请为这个功能编写测试用例
@architect 请审查这个架构设计
```

### 协作调用
```
@backend @frontend 我们一起来设计用户认证系统
@database @tester 请协作完成数据迁移的测试
@all 请查看这个功能的实现，有什么建议？
```

### 任务分配
```
@architect: 设计整体架构
@backend: 实现API接口
@frontend: 开发用户界面
@database: 设计数据表
@tester: 编写测试用例
```

## 🔧 实际项目应用

### FilmTrip项目开发流程

#### 1. 功能规划阶段
```
主Agent: 我们需要开发地图功能，显示照片拍摄位置
@architect: 设计地图功能架构，选择地图服务
@backend: 设计位置数据API
@frontend: 设计地图界面组件
@database: 设计位置数据表结构
```

#### 2. 开发实现阶段
```
@backend: 实现位置数据API
@frontend: 开发地图组件
@database: 创建位置数据表
@tester: 编写地图功能测试
```

#### 3. 测试验证阶段
```
@tester: 执行功能测试，发现地图加载慢的问题
@frontend: 优化地图组件性能
@backend: 优化位置数据API响应
@devops: 监控地图服务性能
```

## 💡 高效协作技巧

### 1. 明确任务边界
```
@backend 负责API实现和业务逻辑
@frontend 负责用户界面和交互体验
@database 负责数据结构和查询优化
@tester 负责测试覆盖和质量保证
```

### 2. 保持上下文一致
```
@backend 这个API的响应格式是 {id, name, location}
@frontend 好的，我来更新前端代码以匹配这个格式
@database 数据表结构已更新，需要迁移脚本
```

### 3. 及时同步进度
```
@backend API开发完成，已提交代码
@frontend 前端组件开发完成，正在测试
@tester 测试用例编写完成，开始执行测试
@architect 整体功能符合设计要求
```

## 🚨 常见问题解决

### 问题1: Agent响应不准确
**解决方案**: 明确指定Agent和任务范围
```
❌ 模糊: "帮我开发功能"
✅ 明确: "@backend 请实现用户登录API，使用JWT认证"
```

### 问题2: 多个Agent冲突
**解决方案**: 明确分工，避免重复工作
```
@backend 负责后端API实现
@frontend 负责前端界面开发
@database 负责数据库设计
```

### 问题3: 上下文丢失
**解决方案**: 定期总结和同步
```
@all 功能开发进度总结：
- 后端API: 80%完成
- 前端界面: 60%完成
- 数据库: 100%完成
- 测试: 30%完成
```

## 📚 进阶使用

### 1. 自定义Agent
在 `.cursorrules` 文件中添加自定义Agent：
```
### @security - 安全专家
- **职责**: 安全审查、漏洞检测、安全最佳实践
- **专长**: 安全测试、代码审计、安全配置
```

### 2. 项目特定配置
为FilmTrip项目定制Agent职责：
```
### FilmTrip项目Agent配置
- @backend: 专注Node.js + Express + SQLite
- @frontend: 专注React + Tailwind CSS
- @database: 专注SQLite优化和文件存储
```

### 3. 工作流自动化
创建标准化的开发工作流：
```
标准开发流程：
1. @architect 设计架构
2. @backend 实现API
3. @frontend 开发界面
4. @database 优化数据
5. @tester 验证功能
6. @devops 部署上线
```

## 🎉 开始你的多Agent协作之旅

现在你已经了解了Cursor多Agent协作的基本概念和使用方法！

### 下一步行动：
1. **打开Cursor Chat** 开始使用
2. **尝试调用不同Agent** 体验协作效果
3. **应用到实际项目** 提高开发效率
4. **优化协作流程** 持续改进

### 记住关键点：
- 明确指定Agent (`@agent名称`)
- 清晰描述任务和要求
- 保持Agent间的良好沟通
- 定期同步和总结进度

---

**开始享受高效的AI协作开发体验吧！** 🚀🤖
