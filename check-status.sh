#!/bin/bash

# 服务状态检查脚本
# 使用方法: ./check-status.sh

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

echo -e "${BLUE}📊 ${PROJECT_NAME} 服务状态检查${NC}"
echo -e "${BLUE}📁 项目目录: $(pwd)${NC}"
echo ""

# 检查端口状态
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -ti:$port | head -1)
        echo -e "${GREEN}✅ $service_name 运行中${NC}"
        echo -e "  端口: $port"
        echo -e "  PID: $pid"
        echo -e "  状态: 活跃"
    else
        echo -e "${RED}❌ $service_name 未运行${NC}"
        echo -e "  端口: $port"
        echo -e "  状态: 未启动"
    fi
}

# 检查PID文件
check_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name PID文件有效${NC}"
            echo -e "  PID: $pid"
            echo -e "  状态: 进程存在"
        else
            echo -e "${YELLOW}⚠️  $service_name PID文件无效${NC}"
            echo -e "  PID: $pid"
            echo -e "  状态: 进程不存在"
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name PID文件不存在${NC}"
    fi
}

# 检查日志文件
check_logs() {
    echo -e "${BLUE}📝 日志文件状态:${NC}"
    
    if [ -f "logs/backend.log" ]; then
        local backend_size=$(du -h logs/backend.log | cut -f1)
        echo -e "  后端日志: logs/backend.log ($backend_size)"
    else
        echo -e "  后端日志: 不存在"
    fi
    
    if [ -f "logs/frontend.log" ]; then
        local frontend_size=$(du -h logs/frontend.log | cut -f1)
        echo -e "  前端日志: logs/frontend.log ($frontend_size)"
    else
        echo -e "  前端日志: 不存在"
    fi
}

# 检查数据库
check_database() {
    echo -e "${BLUE}🗄️  数据库状态:${NC}"
    
    if [ -f "backend/data/photography.db" ]; then
        local db_size=$(du -h backend/data/photography.db | cut -f1)
        echo -e "  数据库文件: backend/data/photography.db ($db_size)"
        
        # 检查数据库连接
        if cd backend && node -e "const db = require('./models/db'); console.log('数据库连接正常')" 2>/dev/null; then
            echo -e "  数据库连接: ${GREEN}正常${NC}"
        else
            echo -e "  数据库连接: ${RED}异常${NC}"
        fi
        cd ..
    else
        echo -e "  数据库文件: 不存在"
    fi
}

# 主检查逻辑
echo -e "${BLUE}🔍 端口状态检查:${NC}"
check_port $BACKEND_PORT "后端服务"
echo ""
check_port $FRONTEND_PORT "前端服务"
echo ""

echo -e "${BLUE}🔍 PID文件检查:${NC}"
check_pid_file "logs/backend.pid" "后端服务"
check_pid_file "logs/frontend.pid" "前端服务"
echo ""

check_logs
echo ""

check_database
echo ""

# 总结
echo -e "${BLUE}📋 快速操作:${NC}"
echo -e "  启动服务: ./start-background.sh"
echo -e "  停止服务: ./stop-services.sh"
echo -e "  查看后端日志: tail -f logs/backend.log"
echo -e "  查看前端日志: tail -f logs/frontend.log"
