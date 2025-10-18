#!/bin/bash

# FilmTrip Vercel 部署准备脚本

echo "🚀 FilmTrip Vercel 部署准备"
echo "=============================="

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 项目结构检查通过"

# 检查 Git 仓库
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    echo "✅ Git 仓库初始化完成"
else
    echo "✅ Git 仓库已存在"
fi

# 创建 .gitignore 如果不存在
if [ ! -f ".gitignore" ]; then
    echo "📝 创建 .gitignore 文件..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production

# Build outputs
*/dist/
*/build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Uploads
uploads/
static/uploads/
EOF
    echo "✅ .gitignore 文件创建完成"
fi

# 检查配置文件
echo "🔍 检查配置文件..."

if [ -f "frontend/vercel.json" ]; then
    echo "✅ 前端 vercel.json 配置存在"
else
    echo "❌ 前端 vercel.json 配置缺失"
fi

if [ -f "backend/vercel.json" ]; then
    echo "✅ 后端 vercel.json 配置存在"
else
    echo "❌ 后端 vercel.json 配置缺失"
fi

if [ -f "project/config/.env.production.example" ]; then
    echo "✅ 环境变量模板存在"
else
    echo "❌ 环境变量模板缺失"
fi

if [ -f "DEPLOYMENT.md" ]; then
    echo "✅ 部署指南存在"
else
    echo "❌ 部署指南缺失"
fi

echo ""
echo "📋 下一步操作："
echo "1. 复制 project/config/.env.production.example 为 .env.production 并配置环境变量"
echo "2. 提交代码到 GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Vercel deployment'"
echo "   git remote add origin https://github.com/your-username/filmtrip.git"
echo "   git push -u origin main"
echo "3. 按照 DEPLOYMENT.md 指南在 Vercel 中部署"
echo ""
echo "🎉 部署准备完成！请查看 DEPLOYMENT.md 获取详细部署步骤。"
