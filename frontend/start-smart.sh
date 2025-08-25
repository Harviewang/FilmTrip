#!/bin/bash

# FilmTrip 前端智能启动脚本
# 避免会话阻断，支持后台运行

echo "🚀 FilmTrip 前端智能启动脚本"
echo "================================"

# 检查是否已经在运行
if lsof -i :3002 > /dev/null 2>&1; then
    echo "⚠️  端口 3002 已被占用"
    echo "🔍 检查现有进程..."
    
    # 显示占用端口的进程
    lsof -i :3002
    
    echo ""
    read -p "是否要停止现有服务并重新启动？(y/n): " choice
    case "$choice" in 
        y|Y ) 
            echo "🛑 停止现有服务..."
            pkill -f "npm run dev"
            sleep 2
            ;;
        * ) 
            echo "✅ 保持现有服务运行"
            echo "🌐 前端地址: http://localhost:3002/"
            exit 0
            ;;
    esac
fi

# 清理可能的PID文件
if [ -f ".frontend.pid" ]; then
    echo "🧹 清理旧的PID文件..."
    rm -f .frontend.pid
fi

# 启动前端服务（后台运行）
echo "✅ 启动前端服务..."
nohup npm run dev > frontend.log 2>&1 &

# 保存PID
echo $! > .frontend.pid
echo "📝 服务PID: $!"

# 等待服务启动
echo "⏳ 等待服务启动..."
for i in {1..10}; do
    if lsof -i :3002 > /dev/null 2>&1; then
        echo "🎉 前端服务启动成功！"
        echo "🌐 访问地址: http://localhost:3002/"
        echo "📝 日志文件: frontend.log"
        echo "🛑 停止服务: ./stop-frontend.sh 或 kill $(cat .frontend.pid)"
        exit 0
    fi
    echo "⏳ 等待中... ($i/10)"
    sleep 1
done

echo "❌ 服务启动超时，请检查日志文件"
echo "📝 查看日志: tail -f frontend.log"
exit 1
