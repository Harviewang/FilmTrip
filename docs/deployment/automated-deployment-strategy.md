# 自动化发布策略 - ECS多服务共存方案

## 日期
2025-11-13

## 背景

### 现状
- ECS服务器上运行多个服务
- FilmTrip 后端和前端需要部署
- 需要零停机部署方案
- 需要考虑服务隔离和回滚

### 目标
- 自动化部署流程
- 零停机发布
- 快速回滚能力
- 不影响其他服务
- 环境隔离

---

## 部署时间估算

### 手动部署（当前方案）
- **后端部署**：10-15分钟
  - 拉取代码：1-2分钟
  - 安装依赖：2-3分钟
  - 环境变量配置：2-3分钟
  - 数据库迁移：1-2分钟
  - 重启服务：1-2分钟
  - 验证测试：3-5分钟

- **前端部署**：5-8分钟
  - 构建：2-3分钟
  - 上传到服务器：1-2分钟
  - Nginx配置：1分钟
  - 验证测试：1-2分钟

- **又拍云配置**：15-20分钟
  - 环境变量配置：3-5分钟
  - 域名验证：5-10分钟（等待DNS）
  - SSL证书配置：2-3分钟
  - 样式配置：3-5分钟
  - 验证测试：2-5分钟

**总计（首次部署）**：30-43分钟

### 自动化部署（目标方案）
- **后端部署**：3-5分钟
- **前端部署**：2-3分钟
- **又拍云配置**：已配置（无需重复）
- **验证测试**：1-2分钟

**总计（后续部署）**：6-10分钟

---

## 自动化发布方案

### 方案1：GitHub Actions + ECS（推荐）

#### 架构
```
GitHub Push → GitHub Actions → ECS部署脚本 → 服务重启
```

#### 优点
- 与Git集成，自动化触发
- 支持多环境（dev/staging/prod）
- 可配置部署审批流程
- 支持并行部署（后端+前端）

#### 实施步骤
1. 创建 GitHub Actions workflow
2. 配置 ECS SSH密钥
3. 编写部署脚本
4. 配置环境变量（GitHub Secrets）
5. 测试部署流程

#### 部署流程
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'frontend/**'
      - '.github/workflows/deploy-production.yml'

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.ECS_HOST }}
          username: ${{ secrets.ECS_USER }}
          key: ${{ secrets.ECS_SSH_KEY }}
          script: |
            cd /path/to/filmtrip
            git pull origin main
            cd backend
            npm install --production
            pm2 restart filmtrip-backend || pm2 start ecosystem.config.js
            pm2 save
      
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy Frontend
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.ECS_HOST }}
          username: ${{ secrets.ECS_USER }}
          key: ${{ secrets.ECS_SSH_KEY }}
          source: "frontend/dist/*"
          target: "/path/to/nginx/html/filmtrip"
```

---

### 方案2：PM2 + Git Hook（简化版）

#### 架构
```
Git Push → Git Hook (服务器端) → 自动拉取代码 → PM2重启
```

#### 优点
- 无需外部CI/CD平台
- 部署脚本简单
- 快速响应

#### 缺点
- 缺少部署日志和审批流程
- 错误处理较弱

#### 实施步骤
1. 在ECS服务器配置Git Hook
2. 配置PM2进程管理
3. 编写自动部署脚本
4. 配置环境变量保护

---

### 方案3：Docker + Docker Compose（容器化）

#### 架构
```
Docker Image → Docker Compose → 容器编排 → 零停机滚动更新
```

#### 优点
- 环境隔离（不影响其他服务）
- 快速回滚（切换镜像）
- 资源隔离
- 易于扩展

#### 缺点
- 需要迁移到容器化
- 学习成本

#### 实施步骤
1. 创建 Dockerfile（后端+前端）
2. 配置 Docker Compose
3. 设置镜像仓库
4. 配置健康检查
5. 实现滚动更新

---

## 零停机部署策略

### 策略1：PM2 Cluster Mode（后端）

```javascript
// backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'filmtrip-backend',
    script: './index.js',
    instances: 2, // 多实例
    exec_mode: 'cluster',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    // 优雅重启
    reload_delay: 1000,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

**部署流程**：
1. 拉取最新代码
2. 安装依赖
3. `pm2 reload filmtrip-backend`（优雅重启，零停机）
4. 验证健康检查

### 策略2：Nginx负载均衡（前端）

```nginx
# nginx配置
upstream filmtrip_backend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name api.filmtrip.cn;
    
    location / {
        proxy_pass http://filmtrip_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 策略3：蓝绿部署（高级）

```
版本A（当前生产） → 版本B（新版本） → 切换流量 → 下线版本A
```

**优点**：
- 真正的零停机
- 快速回滚
- 安全的验证阶段

**缺点**：
- 需要双倍资源
- 配置复杂

---

## 服务隔离方案

### 方案1：端口隔离（当前推荐）

```bash
# 不同服务使用不同端口
FilmTrip 后端: 3001
FilmTrip 前端: 80/443 (Nginx)
其他服务A: 3002
其他服务B: 3003
```

**PM2配置**：
```javascript
{
  apps: [
    {
      name: 'filmtrip-backend',
      script: './backend/index.js',
      env: { PORT: 3001 }
    },
    {
      name: 'other-service-a',
      script: './other-a/index.js',
      env: { PORT: 3002 }
    },
    {
      name: 'other-service-b',
      script: './other-b/index.js',
      env: { PORT: 3003 }
    }
  ]
}
```

### 方案2：目录隔离

```bash
/home/user/
  ├── filmtrip/
  │   ├── backend/
  │   └── frontend/
  ├── other-service-a/
  └── other-service-b/
```

每个服务独立目录，避免冲突。

### 方案3：Docker容器隔离（最佳）

```yaml
# docker-compose.yml
version: '3.8'

services:
  filmtrip-backend:
    container_name: filmtrip-backend
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - filmtrip-network
  
  filmtrip-frontend:
    container_name: filmtrip-frontend
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - filmtrip-backend
    restart: unless-stopped
    networks:
      - filmtrip-network

networks:
  filmtrip-network:
    driver: bridge
```

---

## 回滚策略

### 快速回滚（Git）

```bash
# 回滚到上一个版本
git log --oneline -5  # 查看提交历史
git reset --hard <previous-commit-id>
pm2 reload filmtrip-backend
```

### PM2回滚

```bash
# PM2自动保存历史版本
pm2 save  # 保存当前配置
pm2 resurrect  # 恢复之前的配置
```

### 版本标记回滚

```bash
# 使用Git标签标记版本
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 回滚到特定版本
git checkout v1.0.0
pm2 reload filmtrip-backend
```

---

## 部署安全检查清单

### 部署前
- [ ] 代码审查完成
- [ ] 测试通过（本地/CI）
- [ ] 数据库备份完成
- [ ] 环境变量已配置
- [ ] 依赖已更新

### 部署中
- [ ] 健康检查正常
- [ ] 日志无错误
- [ ] 监控指标正常
- [ ] 其他服务未受影响

### 部署后
- [ ] 功能验证通过
- [ ] 性能指标正常
- [ ] 错误率在可接受范围
- [ ] 监控告警正常

---

## 推荐方案

### 短期（立即实施）
**方案2：PM2 + Git Hook**
- 快速实施（1-2小时）
- 自动化部署
- 零停机重启
- 不影响其他服务

### 中期（1-2周内）
**方案1：GitHub Actions**
- 完整的CI/CD流程
- 部署日志和审批
- 多环境支持

### 长期（1-2个月内）
**方案3：Docker容器化**
- 完整的服务隔离
- 更好的资源管理
- 易于扩展

---

## 实施计划

### 第一阶段：基础自动化（1-2天）
1. 配置PM2进程管理
2. 编写自动部署脚本
3. 配置Git Hook
4. 测试部署流程

### 第二阶段：CI/CD集成（1周）
1. 配置GitHub Actions
2. 设置环境变量（Secrets）
3. 配置部署审批流程
4. 完善监控和告警

### 第三阶段：容器化（可选，2-4周）
1. 创建Dockerfile
2. 配置Docker Compose
3. 迁移到容器化
4. 实现滚动更新

---

## 时间估算总结

### 手动部署
- **首次部署**：30-43分钟
- **后续部署**：15-20分钟

### 自动化部署（方案2：PM2 + Git Hook）
- **首次部署**：30-43分钟（仍需手动配置）
- **后续部署**：3-5分钟（自动化）

### 自动化部署（方案1：GitHub Actions）
- **首次部署**：30-43分钟（仍需手动配置）
- **后续部署**：6-10分钟（完全自动化）

### 容器化部署
- **首次部署**：2-4小时（迁移成本）
- **后续部署**：3-5分钟（完全自动化，零停机）

---

## 下一步行动

### 立即讨论
1. **选择部署方案**（推荐：方案2作为过渡，方案1作为目标）
2. **确认ECS资源**（端口、目录、PM2配置）
3. **制定部署时间表**

### 建议
- **现在**：使用方案2快速实现自动化（不影响其他服务）
- **下周**：升级到方案1（完整的CI/CD）
- **未来**：考虑方案3（容器化，更好的隔离）

---

**最后更新**：2025-11-13  
**状态**：待讨论和决策

