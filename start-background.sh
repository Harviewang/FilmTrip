#!/bin/bash

# 后台启动脚本 - 专门用于后台启动前后端服务
# 使用方法: ./start-background.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="胶片管理系统"
BACKEND_PORT=3001
FRONTEND_PORT=3002

echo -e "${BLUE}🚀 后台启动 ${PROJECT_NAME}...${NC}"
echo -e "${BLUE}📁 项目目录: $(pwd)${NC}"

# 检查端口占用
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口 $port 已被占用，正在清理...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# 启动后端服务
start_backend() {
    echo -e "${BLUE}🔧 启动后端服务...${NC}"
    cd backend
    
    # 后台启动后端
    nohup node index.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    echo -e "${GREEN}✅ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
    echo -e "${BLUE}📝 后端日志: logs/backend.log${NC}"
    
    cd ..
}

# 启动前端服务
start_frontend() {
    echo -e "${BLUE}🔧 启动前端服务...${NC}"
    
    # 使用专门的前端启动脚本
    ./start-frontend.sh
    FRONTEND_PID=$(cat logs/frontend.pid)
    
    echo -e "${GREEN}✅ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"
    echo -e "${BLUE}📝 前端日志: logs/frontend.log${NC}"
}

# 创建日志目录
mkdir -p logs

# 清理端口
check_port $BACKEND_PORT "后端"
check_port $FRONTEND_PORT "前端"

# 启动服务
start_backend
start_frontend

# 保存进程ID到文件
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo -e "${GREEN}🎉 所有服务已后台启动！${NC}"
echo -e "${BLUE}📊 服务状态:${NC}"
echo -e "  后端: http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)"
echo -e "  前端: http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)"
echo -e "${BLUE}📝 查看日志:${NC}"
echo -e "  后端: tail -f logs/backend.log"
echo -e "  前端: tail -f logs/frontend.log"
echo -e "${BLUE}🛑 停止服务: ./stop-services.sh${NC}"
