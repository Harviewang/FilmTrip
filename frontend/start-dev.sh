#!/bin/bash

echo "🚀 启动前端开发服务器..."

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ 端口 $port 已被占用，正在清理..."
        pkill -f "node.*$port" 2>/dev/null
        pkill -f "npm run dev" 2>/dev/null
        sleep 2
    fi
}

# 清理端口
check_port 3002
check_port 3003

echo "✅ 端口清理完成，启动服务器..."

# 启动服务器并设置超时
timeout 30s npm run dev &
SERVER_PID=$!

# 等待服务器启动
echo "⏳ 等待服务器启动..."
for i in {1..30}; do
    if curl -s http://localhost:3002/ >/dev/null 2>&1; then
        echo "✅ 服务器启动成功！访问地址: http://localhost:3002/"
        echo "📝 服务器进程ID: $SERVER_PID"
        echo "🛑 按 Ctrl+C 停止服务器"
        
        # 等待用户中断
        wait $SERVER_PID
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo "❌ 服务器启动超时！"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
    
    echo "⏳ 等待中... ($i/30)"
    sleep 1
done
