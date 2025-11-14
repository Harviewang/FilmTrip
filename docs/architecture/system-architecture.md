# FilmTrip 系统架构图

**版本**：v1.0  
**最后更新**：2025-11-14  
**状态**：PostgreSQL迁移中

---

## 📊 整体系统架构

```mermaid
graph TB
    subgraph "用户层"
        User[👤 用户]
        Admin[👨‍💼 管理员]
    end

    subgraph "前端应用层"
        Frontend[React 19 + Vite<br/>Tailwind CSS<br/>localhost:3000/3002<br/>或 filmtrip.imhw.top]
        MapLib[地图组件<br/>Leaflet / 高德地图]
    end

    subgraph "API网关层"
        API[Express.js API<br/>Serverless Functions<br/>localhost:3001<br/>或 api.filmtrip.imhw.top]
        Auth[JWT认证中间件]
        CORS[CORS中间件]
    end

    subgraph "业务逻辑层"
        Controller[Controllers<br/>业务控制器]
        Routes[Routes<br/>API路由]
        Middleware[中间件<br/>日志/错误处理]
    end

    subgraph "数据持久层"
        DBModel[数据库模型层<br/>db.js / db-pg.js]
    end

    subgraph "数据存储层"
        PostgreSQL[(PostgreSQL数据库<br/>Supabase / ECS)]
        SQLite[(SQLite<br/>开发环境<br/>已弃用)]
    end

    subgraph "文件存储层"
        UpYun[又拍云 UpYun<br/>对象存储 + CDN<br/>filmtrip-dev/prod]
        DirectUpload[直传上传服务]
        ImageProcess[图片处理<br/>Sharp + EXIF]
    end

    subgraph "部署平台"
        Vercel[Vercel<br/>Serverless Functions<br/>前端 + 后端]
        ECS[阿里云ECS<br/>生产环境<br/>可选]
    end

    subgraph "第三方服务"
        GitHub[GitHub<br/>代码仓库 + CI/CD]
    end

    %% 用户访问流程
    User --> Frontend
    Admin --> Frontend
    Frontend --> MapLib
    
    %% API调用流程
    Frontend -->|HTTP/HTTPS| API
    API --> Auth
    API --> CORS
    CORS --> Routes
    Routes --> Controller
    Controller --> Middleware
    Middleware --> DBModel

    %% 数据访问流程
    DBModel -->|优先| PostgreSQL
    DBModel -.->|已弃用| SQLite

    %% 文件上传流程
    Frontend -->|直传| DirectUpload
    DirectUpload --> UpYun
    UpYun -->|回调| API
    Controller --> ImageProcess
    ImageProcess --> UpYun

    %% 部署关系
    Frontend --> Vercel
    API --> Vercel
    API -.->|可选| ECS
    PostgreSQL -->|Supabase| Vercel
    PostgreSQL -.->|可选| ECS

    %% 代码管理
    GitHub -->|自动部署| Vercel

    %% 样式
    classDef frontend fill:#61dafb,stroke:#20232a,stroke-width:2px,color:#000
    classDef backend fill:#339933,stroke:#000,stroke-width:2px,color:#fff
    classDef database fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    classDef storage fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
    classDef deployment fill:#000,stroke:#fff,stroke-width:2px,color:#fff

    class Frontend,MapLib frontend
    class API,Auth,CORS,Controller,Routes,Middleware backend
    class DBModel,PostgreSQL,SQLite database
    class UpYun,DirectUpload,ImageProcess storage
    class Vercel,ECS,GitHub deployment
```

---

## 🌍 部署架构图

```mermaid
graph LR
    subgraph "本地开发环境"
        LocalFE[前端<br/>localhost:3000<br/>React Dev Server]
        LocalBE[后端<br/>localhost:3001<br/>Node.js + Express]
        LocalDB[(Supabase PostgreSQL<br/>远程数据库)]
    end

    subgraph "测试环境 (Vercel)"
        TestFE[前端<br/>filmtrip.imhw.top<br/>Vercel CDN]
        TestBE[后端<br/>api.filmtrip.imhw.top<br/>Vercel Functions]
        TestDB[(Supabase PostgreSQL<br/>测试数据库)]
        TestStorage[又拍云<br/>filmtrip-dev bucket]
    end

    subgraph "生产环境"
        ProdFE[前端<br/>filmtrip.cn<br/>Vercel CDN]
        ProdBE[后端<br/>api.filmtrip.cn<br/>Vercel Functions<br/>或 ECS]
        ProdDB[(PostgreSQL<br/>Supabase 或<br/>ECS PostgreSQL)]
        ProdStorage[又拍云<br/>filmtrip-prod bucket]
    end

    subgraph "外部服务"
        Supabase[(Supabase<br/>PostgreSQL云服务)]
        UpYun[又拍云<br/>对象存储 + CDN]
        GitHub[GitHub<br/>代码仓库]
    end

    %% 本地环境连接
    LocalFE --> LocalBE
    LocalBE --> LocalDB
    LocalBE --> TestStorage

    %% 测试环境连接
    TestFE --> TestBE
    TestBE --> TestDB
    TestBE --> TestStorage
    TestDB --> Supabase
    TestStorage --> UpYun

    %% 生产环境连接
    ProdFE --> ProdBE
    ProdBE --> ProdDB
    ProdBE --> ProdStorage
    ProdDB --> Supabase
    ProdDB -.->|可选| ECS
    ProdStorage --> UpYun

    %% 部署流程
    GitHub -->|Push触发| TestBE
    GitHub -->|Push触发| TestFE
    GitHub -->|手动/自动| ProdBE
    GitHub -->|手动/自动| ProdFE

    %% 样式
    classDef local fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef test fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    classDef prod fill:#ffebee,stroke:#f44336,stroke-width:2px
    classDef external fill:#e3f2fd,stroke:#2196f3,stroke-width:2px

    class LocalFE,LocalBE,LocalDB local
    class TestFE,TestBE,TestDB,TestStorage test
    class ProdFE,ProdBE,ProdDB,ProdStorage prod
    class Supabase,UpYun,GitHub external
```

---

## 🔄 数据流架构图

```mermaid
sequenceDiagram
    participant User as 👤 用户
    participant Frontend as 前端 (React)
    participant API as 后端 API
    participant DB as PostgreSQL
    participant Storage as 又拍云

    Note over User,Storage: 照片上传流程
    User->>Frontend: 选择照片上传
    Frontend->>API: POST /api/storage/upload-token
    API->>Frontend: 返回直传凭证
    Frontend->>Storage: 直接上传到又拍云
    Storage->>API: 上传完成回调
    API->>DB: 保存照片元数据
    API->>Frontend: 返回上传结果
    Frontend->>User: 显示上传成功

    Note over User,Storage: 照片浏览流程
    User->>Frontend: 访问照片列表
    Frontend->>API: GET /api/photos
    API->>DB: 查询照片数据
    DB->>API: 返回照片列表
    API->>Frontend: 返回JSON数据
    Frontend->>Storage: 加载图片 (CDN)
    Storage->>Frontend: 返回图片
    Frontend->>User: 显示照片

    Note over User,Storage: 认证流程
    User->>Frontend: 登录
    Frontend->>API: POST /api/admin/login
    API->>DB: 验证用户信息
    DB->>API: 返回用户数据
    API->>Frontend: 返回JWT Token
    Frontend->>Frontend: 存储Token
    Frontend->>User: 登录成功
```

---

## 🏗️ 技术栈架构

```mermaid
graph TD
    subgraph "前端技术栈"
        React[React 19]
        Vite[Vite 7]
        Tailwind[Tailwind CSS]
        Router[React Router]
        Leaflet[Leaflet / 高德地图]
        Axios[Axios HTTP Client]
        Motion[Framer Motion]
    end

    subgraph "后端技术栈"
        Node[Node.js]
        Express[Express 5]
        JWT[JWT认证]
        Sharp[Sharp图片处理]
        Multer[Multer文件上传]
        Morgan[Morgan日志]
        CORS[CORS中间件]
    end

    subgraph "数据库技术栈"
        PG[PostgreSQL]
        PGPromise[pg-promise]
        Supabase[Supabase SDK]
    end

    subgraph "存储技术栈"
        UpYunAPI[又拍云 API]
        CDN[CDN加速]
        DirectUpload[直传上传]
    end

    subgraph "部署技术栈"
        VercelDeploy[Vercel部署]
        Serverless[Serverless Functions]
        GitHubActions[GitHub Actions CI/CD]
    end

    React --> Vite
    Vite --> Tailwind
    React --> Router
    React --> Leaflet
    React --> Axios
    React --> Motion

    Node --> Express
    Express --> JWT
    Express --> Sharp
    Express --> Multer
    Express --> Morgan
    Express --> CORS

    PG --> PGPromise
    PG --> Supabase

    UpYunAPI --> CDN
    UpYunAPI --> DirectUpload

    VercelDeploy --> Serverless
    GitHubActions --> VercelDeploy

    %% 样式
    classDef frontend fill:#61dafb,stroke:#20232a,stroke-width:2px
    classDef backend fill:#339933,stroke:#000,stroke-width:2px,color:#fff
    classDef database fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    classDef storage fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
    classDef deploy fill:#000,stroke:#fff,stroke-width:2px,color:#fff

    class React,Vite,Tailwind,Router,Leaflet,Axios,Motion frontend
    class Node,Express,JWT,Sharp,Multer,Morgan,CORS backend
    class PG,PGPromise,Supabase database
    class UpYunAPI,CDN,DirectUpload storage
    class VercelDeploy,Serverless,GitHubActions deploy
```

---

## 📦 模块依赖关系图

```mermaid
graph TD
    subgraph "前端模块"
        Pages[Pages<br/>页面组件]
        Components[Components<br/>UI组件]
        Services[Services<br/>API服务]
        Hooks[Custom Hooks<br/>业务逻辑]
        Utils[Utils<br/>工具函数]
    end

    subgraph "后端模块"
        Routes[Routes<br/>路由定义]
        Controllers[Controllers<br/>业务控制器]
        Models[Models<br/>数据模型]
        Middleware[Middleware<br/>中间件]
        UtilsBE[Utils<br/>工具函数]
    end

    subgraph "数据模块"
        DB[数据库连接层<br/>db.js / db-pg.js]
        Migrations[Migrations<br/>数据库迁移]
    end

    Pages --> Components
    Pages --> Services
    Components --> Hooks
    Services --> Utils
    Hooks --> Services

    Routes --> Controllers
    Controllers --> Models
    Controllers --> Middleware
    Models --> DB
    Middleware --> UtilsBE

    DB --> Migrations

    %% 样式
    classDef frontend fill:#61dafb,stroke:#20232a,stroke-width:2px
    classDef backend fill:#339933,stroke:#000,stroke-width:2px,color:#fff
    classDef data fill:#336791,stroke:#fff,stroke-width:2px,color:#fff

    class Pages,Components,Services,Hooks,Utils frontend
    class Routes,Controllers,Models,Middleware,UtilsBE backend
    class DB,Migrations data
```

---

## 🔐 安全架构图

```mermaid
graph TB
    subgraph "前端安全"
        HTTPS[HTTPS加密传输]
        TokenStorage[JWT Token存储<br/>LocalStorage]
        XSSProtect[XSS防护<br/>React自动转义]
    end

    subgraph "API安全"
        CORS[CORS策略<br/>域名白名单]
        JWTVerify[JWT验证<br/>中间件]
        RateLimit[速率限制<br/>待实现]
        InputValidate[输入验证<br/>参数校验]
    end

    subgraph "数据安全"
        SQLInjection[SQL注入防护<br/>参数化查询]
        DataEncrypt[数据加密<br/>敏感字段]
        Backup[数据备份<br/>定期备份]
    end

    subgraph "存储安全"
        UpYunAuth[又拍云签名验证]
        DirectUpload[直传上传<br/>绕过服务器]
        AccessControl[访问控制<br/>私有/公开]
    end

    subgraph "部署安全"
        EnvVar[环境变量<br/>密钥管理]
        GitIgnore[Git忽略<br/>敏感文件]
        SecurityAudit[安全审计<br/>定期检查]
    end

    HTTPS --> CORS
    TokenStorage --> JWTVerify
    XSSProtect --> InputValidate

    JWTVerify --> SQLInjection
    InputValidate --> DataEncrypt

    SQLInjection --> Backup
    DataEncrypt --> AccessControl

    UpYunAuth --> DirectUpload
    DirectUpload --> AccessControl

    EnvVar --> GitIgnore
    GitIgnore --> SecurityAudit

    %% 样式
    classDef security fill:#ff9800,stroke:#fff,stroke-width:2px,color:#000

    class HTTPS,TokenStorage,XSSProtect,CORS,JWTVerify,RateLimit,InputValidate,SQLInjection,DataEncrypt,Backup,UpYunAuth,DirectUpload,AccessControl,EnvVar,GitIgnore,SecurityAudit security
```

---

## 📊 组件说明

### 前端层 (Frontend Layer)
- **技术栈**：React 19 + Vite + Tailwind CSS
- **主要功能**：
  - 照片浏览（画廊/瀑布流/时间轴/地图）
  - 照片上传和管理
  - 胶卷和胶片类型管理
  - 用户认证界面
- **部署**：Vercel CDN

### API层 (API Gateway Layer)
- **技术栈**：Node.js + Express 5
- **部署方式**：Vercel Serverless Functions
- **主要功能**：
  - RESTful API接口
  - JWT认证和授权
  - CORS策略管理
  - 请求日志记录

### 业务逻辑层 (Business Logic Layer)
- **Controllers**：处理业务逻辑
- **Routes**：定义API路由
- **Middleware**：请求预处理（日志、错误处理等）

### 数据持久层 (Data Persistence Layer)
- **数据库**：PostgreSQL（Supabase或ECS）
- **ORM/查询**：pg-promise
- **迁移**：自建迁移脚本

### 文件存储层 (File Storage Layer)
- **服务商**：又拍云（UpYun）
- **功能**：
  - 对象存储（filmtrip-dev/prod buckets）
  - CDN加速
  - 直传上传
  - 图片处理（水印、缩放等）

### 部署平台 (Deployment Platform)
- **Vercel**：前端和后端Serverless部署
- **ECS**（可选）：生产环境传统服务器部署

---

## 🔄 数据流说明

### 上传流程
1. 用户在前端选择照片
2. 前端请求后端获取上传凭证
3. 前端直接上传到又拍云
4. 又拍云回调后端API
5. 后端处理图片（EXIF、缩略图等）
6. 后端保存元数据到数据库
7. 前端显示上传结果

### 浏览流程
1. 用户访问照片列表
2. 前端请求API获取照片数据
3. API从数据库查询元数据
4. 前端从CDN加载图片
5. 用户浏览照片

### 认证流程
1. 用户输入账号密码
2. 前端发送登录请求
3. 后端验证用户信息
4. 后端生成JWT Token
5. 前端存储Token
6. 后续请求携带Token

---

## 🚀 部署说明

### 本地开发环境
- **前端**：`localhost:3000` 或 `localhost:3002`
- **后端**：`localhost:3001`
- **数据库**：Supabase PostgreSQL（远程）

### 测试环境
- **前端**：`https://filmtrip.imhw.top`
- **后端**：`https://api.filmtrip.imhw.top`
- **数据库**：Supabase PostgreSQL（测试数据库）
- **存储**：又拍云 `filmtrip-dev` bucket

### 生产环境
- **前端**：`https://filmtrip.cn`
- **后端**：`https://api.filmtrip.cn`
- **数据库**：Supabase PostgreSQL 或 ECS PostgreSQL（待定）
- **存储**：又拍云 `filmtrip-prod` bucket

---

## 📚 相关文档

- [环境配置方案](../deployment/environment-strategy.md)
- [部署指南](../guides/部署指南.md)
- [PostgreSQL迁移方案](../deployment/postgresql-migration-supabase.md)
- [安全审计报告](../security/security-audit-2025-11-14.md)

---

**最后更新**：2025-11-14  
**维护者**：FilmTrip开发团队

