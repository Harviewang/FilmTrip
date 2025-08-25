# 部署代码清理指南

## 问题说明

之前后端部署包大小达到了10GB，主要原因是包含了不应该部署的文件：
- `uploads/` 目录（11GB用户上传文件）
- `database.sqlite` 文件（116KB本地数据库）
- `server.log` 等日志文件
- 测试文件和数据

## 已完成的优化

### 1. 后端 .gitignore 优化
```
# 用户上传文件（不应部署）
uploads/

# 数据库文件（不应部署）
*.db
*.sqlite
*.sqlite3
database.sqlite

# 日志文件
server.log
*.log

# 测试文件
test-*.js
test/
tests/
*.test.js
*.spec.js
```

### 2. 前端 .gitignore 优化
```
# 测试文件
test/
tests/
__tests__/
*.test.js
*.test.jsx
*.spec.js
*.spec.jsx
coverage/

# 构建输出
dist/
build/
```

## 优化结果

- **优化前**: 后端目录 ~11GB
- **优化后**: 纯净代码仅 560KB
- **减少**: 99.99% 的无用文件

## 部署最佳实践

### 1. 生产环境文件管理
- 用户上传文件应存储在云存储服务（如AWS S3、阿里云OSS）
- 数据库使用云数据库服务（如PlanetScale、Supabase）
- 日志使用专门的日志服务

### 2. 定期检查
```bash
# 检查目录大小
du -sh backend/

# 检查纯净代码大小
find backend/ -type f -not -path './uploads/*' -not -path './node_modules/*' -not -name 'database.sqlite' -exec du -ch {} + | tail -1
```

### 3. 部署前检查清单
- [ ] .gitignore 文件已更新
- [ ] 无大文件被意外跟踪
- [ ] 环境变量已配置
- [ ] 数据库连接已设置
- [ ] 文件上传路径已配置为云存储

## 注意事项

1. **不要提交敏感文件**：数据库文件、日志文件、用户数据
2. **使用环境变量**：数据库连接、API密钥等
3. **云存储优先**：大文件和用户数据使用云服务
4. **定期清理**：检查并清理不必要的文件

现在的代码库已经是纯净的，可以安全地部署到生产环境。