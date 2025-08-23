#!/bin/bash

echo "🚀 启动前端开发服务器..."

# 清理可能占用端口的进程
echo "🧹 清理端口..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "node.*3002" 2>/dev/null
sleep 2

echo "✅ 启动服务器..."
echo "📝 服务器将在后台运行"
echo "🌐 访问地址: http://localhost:3002/"
echo "🛑 停止服务器: pkill -f 'npm run dev'"

# 直接启动，不等待
npm run dev
