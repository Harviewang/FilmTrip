#!/bin/bash

# 停止服务脚本
# 使用方法: ./stop-services.sh

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

echo -e "${BLUE}🛑 停止 ${PROJECT_NAME} 服务...${NC}"

# 从PID文件停止服务
stop_by_pid() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}🔄 停止 $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            sleep 2
            
            # 强制杀死如果还在运行
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  强制停止 $service_name...${NC}"
                kill -9 $pid 2>/dev/null || true
            fi
            
            rm -f "$pid_file"
            echo -e "${GREEN}✅ $service_name 已停止${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name 进程不存在，清理PID文件${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name PID文件不存在${NC}"
    fi
}

# 通过端口停止服务
stop_by_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}🔄 停止 $service_name (端口: $port)...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ 无法停止 $service_name${NC}"
        else
            echo -e "${GREEN}✅ $service_name 已停止${NC}"
        fi
    else
        echo -e "${GREEN}✅ $service_name 未运行${NC}"
    fi
}

# 清理所有相关进程
cleanup_processes() {
    echo -e "${BLUE}🧹 清理所有相关进程...${NC}"
    
    # 停止Node.js进程
    pkill -f "node index.js" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # 停止Vite进程
    pkill -f "vite" 2>/dev/null || true
    
    sleep 2
}

# 主停止逻辑
echo -e "${BLUE}📋 停止服务步骤:${NC}"

# 1. 通过PID文件停止
stop_by_pid "logs/backend.pid" "后端服务"
stop_by_pid "logs/frontend.pid" "前端服务"

# 2. 通过端口停止（备用方案）
stop_by_port $BACKEND_PORT "后端服务"
stop_by_port $FRONTEND_PORT "前端服务"

# 3. 清理所有相关进程
cleanup_processes

echo -e "${GREEN}🎉 所有服务已停止！${NC}"
echo -e "${BLUE}💡 重新启动: ./start-background.sh${NC}"
