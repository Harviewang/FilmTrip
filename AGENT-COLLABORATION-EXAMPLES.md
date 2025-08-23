# 🤖 Cursor多Agent协作开发实战示例

## 📋 概述

本文档展示了如何在Cursor中使用多Agent协作开发FilmTrip项目的具体示例。

## 🚀 实际使用场景

### 场景1: 开发照片上传功能

#### 1. 主Agent发起任务
```
我需要开发照片上传功能，包括拖拽上传、进度显示、缩略图生成。
请各Agent协作完成这个功能。
```

#### 2. 各Agent分工协作

**@architect 架构设计**
```
我来设计照片上传的整体架构：

1. 前端：拖拽上传组件 + 进度条 + 预览
2. 后端：文件上传API + 文件处理 + 存储管理
3. 数据库：照片元数据表 + 文件路径存储
4. 存储：本地文件系统 + 缩略图生成
5. 安全：文件类型验证 + 大小限制 + 权限控制

技术选型：
- 前端：react-dropzone + 进度条组件
- 后端：multer + sharp (图片处理)
- 数据库：新增photos表
```

**@backend 实现后端API**
```
我来实现照片上传的后端API：

1. 创建上传路由：POST /api/photos/upload
2. 文件处理中间件：multer配置
3. 图片处理：sharp生成缩略图
4. 数据库操作：保存照片元数据
5. 错误处理：文件验证、存储失败处理

需要创建：
- routes/photos.js (上传路由)
- middleware/upload.js (文件处理)
- utils/imageProcessor.js (图片处理)
```

**@frontend 开发前端组件**
```
我来创建照片上传的前端组件：

1. 拖拽上传区域：支持拖拽和点击上传
2. 进度显示：上传进度条和状态
3. 预览功能：上传前预览、缩略图显示
4. 错误处理：文件类型、大小验证提示

组件结构：
- PhotoUpload.jsx (主组件)
- DragDropZone.jsx (拖拽区域)
- ProgressBar.jsx (进度条)
- ImagePreview.jsx (图片预览)
```

**@database 设计数据表**
```
我来设计照片相关的数据库表结构：

photos表：
- id: INTEGER PRIMARY KEY
- filename: TEXT NOT NULL
- original_name: TEXT NOT NULL
- file_path: TEXT NOT NULL
- thumbnail_path: TEXT
- file_size: INTEGER
- mime_type: TEXT
- upload_date: DATETIME DEFAULT CURRENT_TIMESTAMP
- user_id: INTEGER (关联用户)

索引：
- CREATE INDEX idx_photos_user_id ON photos(user_id)
- CREATE INDEX idx_photos_upload_date ON photos(upload_date)
```

**@tester 编写测试用例**
```
我来为照片上传功能编写测试用例：

后端测试：
- 文件上传成功测试
- 文件类型验证测试
- 文件大小限制测试
- 权限验证测试
- 错误处理测试

前端测试：
- 拖拽上传测试
- 文件选择测试
- 进度显示测试
- 预览功能测试
- 错误提示测试

集成测试：
- 完整上传流程测试
- 前后端数据一致性测试
```

### 场景2: 用户权限系统重构

#### 1. 主Agent发起任务
```
我们需要重构用户权限系统，支持角色基础访问控制(RBAC)。
请各Agent协作设计并实现这个系统。
```

#### 2. 各Agent协作设计

**@architect 系统设计**
```
我来设计RBAC权限系统架构：

核心概念：
- 用户(User)：系统用户
- 角色(Role)：权限集合
- 权限(Permission)：具体操作权限
- 资源(Resource)：被保护的对象

权限模型：
- 用户可以有多个角色
- 角色可以有多个权限
- 权限控制到具体资源和方法

技术实现：
- JWT token + 角色信息
- 中间件权限验证
- 数据库权限表设计
```

**@backend @database 协作实现**
```
@backend: 我来实现权限验证中间件和API
@database: 我来设计权限相关的数据表

权限表结构：
- users_roles: 用户角色关联表
- roles: 角色表
- permissions: 权限表
- role_permissions: 角色权限关联表
- resources: 资源表

API实现：
- 角色管理API
- 权限分配API
- 权限验证中间件
```

**@frontend 权限管理界面**
```
我来创建权限管理的前端界面：

1. 角色管理页面：创建、编辑、删除角色
2. 权限分配页面：为角色分配权限
3. 用户角色管理：为用户分配角色
4. 权限检查组件：根据权限显示/隐藏内容

组件：
- RoleManagement.jsx
- PermissionAssignment.jsx
- UserRoleManager.jsx
- PermissionGuard.jsx
```

### 场景3: 性能优化协作

#### 1. 主Agent发起任务
```
系统性能需要优化，包括数据库查询、API响应、前端加载速度。
请各Agent协作分析并优化。
```

#### 2. 各Agent性能分析

**@devops 性能监控**
```
我来分析系统性能瓶颈：

监控指标：
- API响应时间
- 数据库查询性能
- 前端加载时间
- 内存和CPU使用率

发现的问题：
- 照片列表API响应慢
- 数据库查询缺少索引
- 前端图片加载未优化
```

**@database 查询优化**
```
我来优化数据库查询性能：

1. 添加缺失的索引
2. 优化复杂查询
3. 实现查询缓存
4. 数据库连接池优化

具体优化：
- photos表添加复合索引
- 实现分页查询优化
- 添加查询结果缓存
```

**@backend API优化**
```
我来优化后端API性能：

1. 实现API缓存
2. 优化数据库查询
3. 添加分页支持
4. 实现数据压缩

优化措施：
- Redis缓存热点数据
- 数据库查询优化
- 响应数据压缩
- 异步处理优化
```

**@frontend 前端优化**
```
我来优化前端性能：

1. 图片懒加载
2. 组件懒加载
3. 状态管理优化
4. 打包优化

具体实现：
- 图片懒加载组件
- React.lazy组件懒加载
- 状态管理优化
- Webpack打包优化
```

## 💡 协作技巧

### 1. 明确分工
```
@backend 负责API实现
@frontend 负责界面开发
@database 负责数据设计
@tester 负责测试验证
```

### 2. 及时沟通
```
@backend 这个API的响应格式需要调整
@frontend 好的，我来同步更新前端代码
@database 数据表结构有变化，需要迁移脚本
```

### 3. 结果整合
```
@all 功能开发完成，请各Agent审查代码
@architect 整体架构设计合理
@tester 测试覆盖率达到要求
@devops 部署配置完成
```

## 🎯 最佳实践

### 1. 任务分解
- 将复杂功能分解为小任务
- 明确每个Agent的职责
- 设定清晰的交付标准

### 2. 沟通协调
- 定期同步开发进度
- 及时解决技术分歧
- 保持代码风格一致

### 3. 质量保证
- 代码审查和测试
- 性能监控和优化
- 文档更新和维护

---

**记住**: 多Agent协作的关键是明确分工、及时沟通、结果整合！
