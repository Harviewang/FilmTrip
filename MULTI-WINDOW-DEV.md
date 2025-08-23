# 🚀 多窗口开发环境指南

## 📋 概述

FilmTrip项目现在支持多窗口并行开发，让你可以同时进行前后端开发，提高开发效率。

## 🪟 可用的启动脚本

### 1. `start-dev-tabs.sh` - iTerm2多Tab模式
- **适用**: 安装了iTerm2的macOS用户
- **功能**: 自动创建5个开发Tab
- **使用方法**: `./start-dev-tabs.sh`

### 2. `start-multi-windows.sh` - 通用多窗口模式
- **适用**: 所有终端类型
- **功能**: 提供详细的多窗口配置指导
- **使用方法**: `./start-multi-windows.sh`

### 3. `start-background.sh` - 后台服务启动
- **功能**: 后台启动所有服务
- **使用方法**: `./start-background.sh`

## 🏗️ 推荐的开发环境结构

### 📁 项目管理终端
- **位置**: 项目根目录
- **用途**: Git操作、服务控制、项目管理
- **推荐命令**:
  ```bash
  ./start-background.sh    # 启动所有服务
  ./stop-services.sh       # 停止所有服务
  git status               # 查看Git状态
  git log --oneline        # 查看提交历史
  ```

### 🔧 后端开发终端
- **位置**: `backend/` 目录
- **用途**: Node.js后端开发、API测试
- **推荐命令**:
  ```bash
  npm run dev              # 开发模式（如果有dev脚本）
  node index.js            # 直接运行
  tail -f ../logs/backend.log  # 监控日志
  ```

### 🎨 前端开发终端
- **位置**: `frontend/` 目录
- **用途**: React前端开发、样式调整
- **推荐命令**:
  ```bash
  npm run dev              # 开发模式
  npm run build            # 构建生产版本
  tail -f ../logs/frontend.log  # 监控日志
  ```

### 🗄️ 数据库监控终端
- **位置**: 项目根目录
- **用途**: 数据库状态监控、日志查看
- **推荐命令**:
  ```bash
  tail -f logs/backend.log      # 监控后端日志
  sqlite3 database.sqlite .tables  # 查看数据库表
  watch -n 2 'ls -la database.sqlite'  # 监控数据库文件变化
  ```

### 📊 日志监控终端
- **位置**: 项目根目录
- **用途**: 前后端日志实时监控
- **推荐命令**:
  ```bash
  tail -f logs/backend.log logs/frontend.log  # 同时监控
  grep -i error logs/*.log                    # 搜索错误
  grep -i warning logs/*.log                  # 搜索警告
  ```

## 🚀 快速开始

### 方法1: 使用iTerm2（推荐）
```bash
./start-dev-tabs.sh
```

### 方法2: 手动创建窗口
```bash
./start-multi-windows.sh
```
然后按照提示手动创建5个终端窗口。

### 方法3: 后台启动服务
```bash
./start-background.sh
```

## 💡 开发工作流建议

1. **启动阶段**:
   - 在"项目管理"终端中运行 `./start-background.sh`
   - 等待所有服务启动完成

2. **开发阶段**:
   - 在"后端开发"终端中进行API开发和测试
   - 在"前端开发"终端中进行UI开发和调试
   - 在"数据库监控"终端中监控数据变化
   - 在"日志监控"终端中实时查看错误和警告

3. **调试阶段**:
   - 使用"日志监控"终端快速定位问题
   - 在相应的开发终端中进行代码修改
   - 利用热重载功能快速验证修改

4. **提交阶段**:
   - 在"项目管理"终端中进行Git操作
   - 使用 `git status` 检查文件状态
   - 使用 `git add` 和 `git commit` 提交代码

## 🔧 端口配置

- **后端服务**: 3001
- **前端服务**: 3002
- **数据库**: SQLite文件

## 📝 日志文件

- **后端日志**: `logs/backend.log`
- **前端日志**: `logs/frontend.log`
- **进程ID**: `logs/backend.pid`, `logs/frontend.pid`

## 🛠️ 故障排除

### 端口被占用
```bash
./stop-services.sh  # 停止所有服务
# 或者手动清理
lsof -ti:3001 | xargs kill -9  # 清理后端端口
lsof -ti:3002 | xargs kill -9  # 清理前端端口
```

### 服务启动失败
1. 检查端口占用情况
2. 查看相应的日志文件
3. 确保依赖已安装（`npm install`）

### 热重载不工作
1. 检查前端开发服务器是否正常运行
2. 确认文件保存后是否触发了重新编译
3. 查看浏览器控制台是否有错误

## 🌟 优势

- **并行开发**: 前后端可以同时进行开发
- **实时监控**: 可以实时查看日志和错误
- **快速调试**: 问题定位更加快速准确
- **高效工作流**: 减少终端切换，提高开发效率
- **项目隔离**: 不同功能在不同终端中，避免混淆

## 📚 相关文档

- [项目README](./README.md)
- [开发日志](./docs/开发日志.md)
- [开发计划](./docs/开发计划.md)
- [问题追踪](./docs/问题追踪.md)

---

**享受高效的并行开发体验！** 🚀
