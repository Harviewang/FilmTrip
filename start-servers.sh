#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 启动胶片管理系统..."
echo "📁 项目目录: $SCRIPT_DIR"

# 启动后端服务
echo "🔧 启动后端服务..."
cd "$SCRIPT_DIR/backend"
node index.js > server.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 3

# 启动前端服务
echo "🎨 启动前端服务..."
cd "$SCRIPT_DIR/frontend"
npm run dev > client.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

# 等待前端启动
sleep 5

# 测试服务状态
echo "🧪 测试服务状态..."
echo "=== 后端测试 ==="
curl -s http://localhost:3001/ | head -c 100
echo -e "\n=== 前端测试 ==="
curl -s http://localhost:3002/ | head -c 100

echo -e "\n🎉 服务启动完成！"
echo "📊 后端: http://localhost:3001 (PID: $BACKEND_PID)"
echo "🎨 前端: http://localhost:3002 (PID: $FRONTEND_PID)"
echo "📝 日志文件:"
echo "   - 后端: $SCRIPT_DIR/backend/server.log"
echo "   - 前端: $SCRIPT_DIR/frontend/client.log"
echo ""
echo "💡 使用以下命令查看日志:"
echo "   tail -f $SCRIPT_DIR/backend/server.log"
echo "   tail -f $SCRIPT_DIR/frontend/client.log"
echo ""
echo "🛑 停止服务: kill $BACKEND_PID $FRONTEND_PID"
