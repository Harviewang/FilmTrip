#!/bin/bash

# 胶片管理系统主启动脚本
# 整合启动、停止、状态检查等功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目信息
PROJECT_NAME="胶片管理系统"
BACKEND_PORT=3001
FRONTEND_PORT=3002

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
LOGS_DIR="$PROJECT_ROOT/logs"

# 创建日志目录
mkdir -p "$LOGS_DIR"

# 显示帮助信息
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start     启动所有服务"
    echo "  stop      停止所有服务"
    echo "  restart   重启所有服务"
    echo "  status    检查服务状态"
    echo "  clean     清理所有进程"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start    # 启动服务"
    echo "  $0 status   # 检查状态"
    echo "  $0 stop     # 停止服务"
}

# 检查服务状态
check_status() {
    echo -e "${BLUE}📊 服务状态检查${NC}"
    echo "=================="
    
    # 检查后端
    if lsof -i :$BACKEND_PORT >/dev/null 2>&1; then
        local backend_pid=$(lsof -ti :$BACKEND_PORT)
        echo -e "${GREEN}✅ 后端服务: 运行中 (PID: $backend_pid, 端口: $BACKEND_PORT)${NC}"
    else
        echo -e "${RED}❌ 后端服务: 未运行${NC}"
    fi
    
    # 检查前端
    if lsof -i :$FRONTEND_PORT >/dev/null 2>&1; then
        local frontend_pid=$(lsof -ti :$FRONTEND_PORT)
        echo -e "${GREEN}✅ 前端服务: 运行中 (PID: $frontend_pid, 端口: $FRONTEND_PORT)${NC}"
    else
        echo -e "${RED}❌ 前端服务: 未运行${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "前端: http://localhost:$FRONTEND_PORT"
    echo -e "后端API: http://localhost:$BACKEND_PORT"
}

# 清理所有相关进程
cleanup_processes() {
    log_info "🧹 清理所有相关进程..."
    
    # 停止Node.js进程
    pkill -f "node index.js" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    # 通过端口停止
    lsof -ti :$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti :$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    
    sleep 2
    log_success "进程清理完成"
}

# 启动后端服务
start_backend() {
    log_info "🔧 启动后端服务..."
    
    if [ ! -f "$BACKEND_DIR/index.js" ]; then
        log_error "后端文件不存在: $BACKEND_DIR/index.js"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # 启动后端
    nohup node index.js > "$LOGS_DIR/backend.log" 2>&1 &
    local backend_pid=$!
    
    # 保存PID
    echo $backend_pid > "$LOGS_DIR/backend.pid"
    
    # 等待后端启动
    log_info "⏳ 等待后端服务启动..."
    local max_wait=30
    local count=0
    
    while [ $count -lt $max_wait ]; do
        if lsof -i :$BACKEND_PORT >/dev/null 2>&1; then
            log_success "后端服务启动成功 (PID: $backend_pid, 端口: $BACKEND_PORT)"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    log_error "后端服务启动超时"
    return 1
}

# 启动前端服务
start_frontend() {
    log_info "🎨 启动前端服务..."
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        log_error "前端文件不存在: $FRONTEND_DIR/package.json"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # 启动前端
    nohup npx vite --port $FRONTEND_PORT --host > "$LOGS_DIR/frontend.log" 2>&1 &
    local frontend_pid=$!
    
    # 保存PID
    echo $frontend_pid > "$LOGS_DIR/frontend.pid"
    
    # 等待前端启动
    log_info "⏳ 等待前端服务启动..."
    local max_wait=30
    local count=0
    
    while [ $count -lt $max_wait ]; do
        if lsof -i :$FRONTEND_PORT >/dev/null 2>&1; then
            log_success "前端服务启动成功 (PID: $frontend_pid, 端口: $FRONTEND_PORT)"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    log_error "前端服务启动超时"
    return 1
}

# 启动所有服务
start_services() {
    log_info "🚀 启动 $PROJECT_NAME..."
    
    # 清理现有进程
    cleanup_processes
    
    # 启动后端
    if start_backend; then
        log_success "后端启动完成"
    else
        log_error "后端启动失败"
        exit 1
    fi
    
    # 启动前端
    if start_frontend; then
        log_success "前端启动完成"
    else
        log_error "前端启动失败"
        exit 1
    fi
    
    log_success "🎉 所有服务启动成功！"
    echo ""
    check_status
}

# 停止所有服务
stop_services() {
    log_info "🛑 停止 $PROJECT_NAME..."
    
    # 通过PID文件停止
    if [ -f "$LOGS_DIR/backend.pid" ]; then
        local backend_pid=$(cat "$LOGS_DIR/backend.pid")
        if ps -p $backend_pid > /dev/null 2>&1; then
            log_info "停止后端服务 (PID: $backend_pid)..."
            kill $backend_pid 2>/dev/null || true
            sleep 2
            if ps -p $backend_pid > /dev/null 2>&1; then
                kill -9 $backend_pid 2>/dev/null || true
            fi
        fi
        rm -f "$LOGS_DIR/backend.pid"
    fi
    
    if [ -f "$LOGS_DIR/frontend.pid" ]; then
        local frontend_pid=$(cat "$LOGS_DIR/frontend.pid")
        if ps -p $frontend_pid > /dev/null 2>&1; then
            log_info "停止前端服务 (PID: $frontend_pid)..."
            kill $frontend_pid 2>/dev/null || true
            sleep 2
            if ps -p $frontend_pid > /dev/null 2>&1; then
                kill -9 $frontend_pid 2>/dev/null || true
            fi
        fi
        rm -f "$LOGS_DIR/frontend.pid"
    fi
    
    # 清理进程
    cleanup_processes
    
    log_success "🎉 所有服务已停止！"
}

# 主逻辑
case "${1:-start}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_services
        ;;
    "status")
        check_status
        ;;
    "clean")
        cleanup_processes
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "未知命令: $1"
        show_help
        exit 1
        ;;
esac

