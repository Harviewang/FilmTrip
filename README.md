# FilmTrip 胶片摄影管理系统

一个专业的胶片摄影管理系统，采用三层清晰结构设计，帮助胶片摄影爱好者管理胶卷、照片、相机和扫描仪等资源。

## 🎯 项目特色

- **三层清晰结构**：胶卷品类 → 胶卷实例 → 照片
- **专业摄影支持**：EXIF信息、地理位置、评分系统
- **多种浏览模式**：画廊模式、瀑布流、时间轴、地图视图
- **智能图片预览**：标准模式、沉浸模式、旋转功能
- **响应式设计**：支持桌面端、平板端、手机端

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 本地启动

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/filmtrip.git
   cd filmtrip
   ```

2. **安装依赖**
   ```bash
   # 后端依赖
   cd backend
   npm install
   
   # 前端依赖
   cd ../frontend
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp project/config/.env.production.example .env.production
   
   # 编辑环境变量
   nano .env.production
   ```

4. **启动服务**
   ```bash
   # 使用项目管理脚本启动
   ./project/start.sh start
   
   # 或者手动启动
   # 后端
   cd backend && npm start
   
   # 前端
   cd frontend && npm run dev
   ```

5. **访问应用**
   - 前端：http://localhost:3002
   - 后端API：http://localhost:3001

## 📁 项目结构

```
FilmTrip/
├── README.md                    # 项目说明文档
├── package.json                 # 根目录包配置
├── backend/                     # 后端代码目录
│   ├── controllers/            # 控制器
│   ├── routes/                 # 路由
│   ├── models/                 # 数据模型
│   ├── scripts/                # 后端脚本
│   └── uploads/                # 上传文件
├── frontend/                    # 前端代码目录
│   ├── src/                    # 源代码
│   ├── public/                 # 静态资源
│   └── dist/                   # 构建输出
├── docs/                        # 文档目录
│   ├── 需求文档.md              # 产品需求
│   ├── 开发日志.md              # 开发历史
│   └── 部署指南.md              # 部署说明
├── project/                     # 项目管理目录
│   ├── deploy.sh               # 部署脚本
│   ├── start.sh                # 启动脚本
│   ├── scripts/                # 项目脚本
│   └── config/                 # 配置文件
└── logs/                        # 运行时日志
```

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express.js** - 服务器框架
- **SQLite** - 数据库（开发环境）
- **Sharp** - 图片处理
- **JWT** - 身份认证
- **Multer** - 文件上传

### 前端
- **React 18** - 用户界面框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理

### 部署
- **Vercel** - 云部署平台
- **自定义域名** - 生产环境访问

## 📚 文档

- **[需求文档](docs/需求文档.md)** - 产品需求规格说明书
- **[开发日志](docs/开发日志.md)** - 开发过程记录
- **[部署指南](docs/部署指南.md)** - 部署和运维说明
- **[API文档](docs/API文档.md)** - 后端API接口说明

## 🔧 开发工具

### 项目管理脚本
```bash
# 启动所有服务
./project/start.sh start

# 停止所有服务
./project/start.sh stop

# 重启服务
./project/start.sh restart

# 检查服务状态
./project/start.sh status

# 清理进程
./project/start.sh clean
```

### 部署脚本
```bash
# 准备Vercel部署
./project/deploy.sh
```

## 🌟 核心功能

### 已实现功能 ✅
- [x] 用户认证系统（JWT）
- [x] 照片上传和管理
- [x] 胶卷品类管理
- [x] 胶卷实例管理
- [x] 相机管理
- [x] 扫描仪管理
- [x] 照片预览功能（标准/沉浸模式）
- [x] 图片旋转功能
- [x] 瀑布流布局
- [x] 画廊模式布局
- [x] 响应式设计
- [x] 云端部署

### 进行中功能 🔄
- [ ] 地图视图优化
- [ ] 时间轴视图完善
- [ ] 统计仪表板
- [ ] 性能优化

### 计划中功能 ⏳
- [ ] 社交分享功能
- [ ] 智能推荐系统
- [ ] 高级筛选功能
- [ ] 数据统计分析

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues：https://github.com/your-username/filmtrip/issues
- 邮箱：your-email@example.com

---

**FilmTrip** - 让胶片摄影管理更简单、更专业！