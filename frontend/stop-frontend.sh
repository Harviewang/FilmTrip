#!/bin/bash

# FilmTrip 前端停止脚本

echo "🛑 FilmTrip 前端停止脚本"
echo "========================"

if [ -f ".frontend.pid" ]; then
    PID=$(cat .frontend.pid)
    echo "📝 找到PID文件: $PID"
    
    if kill -0 $PID 2>/dev/null; then
        echo "🔄 停止进程 $PID..."
        kill $PID
        sleep 2
        
        if kill -0 $PID 2>/dev/null; then
            echo "⚠️  进程仍在运行，强制停止..."
            kill -9 $PID
        fi
        
        echo "✅ 进程已停止"
    else
        echo "⚠️  进程 $PID 不存在"
    fi
    
    rm -f .frontend.pid
else
    echo "🔍 查找前端进程..."
    pkill -f "npm run dev"
    echo "✅ 前端进程已停止"
fi

# 检查端口是否释放
if lsof -i :3002 > /dev/null 2>&1; then
    echo "⚠️  端口 3002 仍被占用"
    lsof -i :3002
else
    echo "✅ 端口 3002 已释放"
fi
