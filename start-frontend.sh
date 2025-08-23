#!/bin/bash

# 前端服务启动脚本
echo "🚀 启动前端服务..."

# 进入前端目录
cd "$(dirname "$0")/frontend"

# 检查端口是否被占用
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3002 已被占用，正在停止现有服务..."
    lsof -ti:3002 | xargs kill -9
    sleep 2
fi

# 启动前端服务到后台
echo "🔧 启动前端服务 (端口: 3002)..."
nohup npm run dev -- --host 0.0.0.0 --port 3002 > ../logs/frontend.log 2>&1 &

# 获取进程ID
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

# 保存PID到文件
echo $FRONTEND_PID > ../logs/frontend.pid

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if curl -s http://localhost:3002 > /dev/null; then
    echo "🎉 前端服务启动成功！"
    echo "📊 服务信息:"
    echo "   前端: http://localhost:3002 (PID: $FRONTEND_PID)"
    echo "📝 日志文件: logs/frontend.log"
    echo "🛑 停止服务: ./stop-services.sh"
else
    echo "❌ 前端服务启动失败，请检查日志: logs/frontend.log"
    exit 1
fi
