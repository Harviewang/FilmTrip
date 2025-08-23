#!/bin/bash

# 胶片管理系统智能启动脚本
# 解决端口冲突、进程管理、启动时序等问题

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

log_info "🚀 启动胶片管理系统..."
log_info "📁 项目目录: $SCRIPT_DIR"

# 函数：强制清理所有相关进程
cleanup_processes() {
    log_info "🧹 清理所有相关进程..."
    
    # 查找并杀死所有相关进程
    local pids=$(ps aux | grep -E "(node.*index\.js|npm.*dev|vite|esbuild)" | grep -v grep | awk '{print $2}')
    
    if [ -n "$pids" ]; then
        log_warning "发现相关进程: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        log_info "没有发现相关进程"
    fi
}

# 函数：等待端口释放
wait_for_port_release() {
    local port=$1
    local service_name=$2
    local max_wait=30
    local count=0
    
    log_info "⏳ 等待 $service_name 端口 $port 释放..."
    
    while lsof -i :$port >/dev/null 2>&1 && [ $count -lt $max_wait ]; do
        log_warning "端口 $port 仍被占用，等待中... ($count/$max_wait)"
        sleep 1
        count=$((count + 1))
    done
    
    if lsof -i :$port >/dev/null 2>&1; then
        log_error "端口 $port 无法释放，强制清理..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    log_success "端口 $port 已释放"
}

# 函数：启动后端服务
start_backend() {
    log_info "🔧 启动后端服务..."
    
    if [ ! -f "$BACKEND_DIR/index.js" ]; then
        log_error "后端文件不存在: $BACKEND_DIR/index.js"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # 启动后端
    nohup node index.js > server.log 2>&1 &
    local backend_pid=$!
    
    # 等待后端启动
    log_info "⏳ 等待后端服务启动..."
    local max_wait=30
    local count=0
    
    while [ $count -lt $max_wait ]; do
        if curl -s http://localhost:3001/ >/dev/null 2>&1; then
            log_success "后端服务启动成功 (PID: $backend_pid)"
            echo $backend_pid > .backend.pid
            return 0
        fi
        
        log_warning "后端服务启动中... ($count/$max_wait)"
        sleep 1
        count=$((count + 1))
    done
    
    log_error "后端服务启动超时"
    return 1
}

# 函数：启动前端服务
start_frontend() {
    log_info "🎨 启动前端服务..."
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        log_error "前端文件不存在: $FRONTEND_DIR/package.json"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # 启动前端
    nohup npm run dev > client.log 2>&1 &
    local frontend_pid=$!
    
    # 等待前端启动
    log_info "⏳ 等待前端服务启动..."
    local max_wait=60
    local count=0
    
    while [ $count -lt $max_wait ]; do
        if curl -s http://localhost:3002/ >/dev/null 2>&1; then
            log_success "前端服务启动成功 (PID: $frontend_pid)"
            echo $frontend_pid > .frontend.pid
            return 0
        fi
        
        log_warning "前端服务启动中... ($count/$max_wait)"
        sleep 2
        count=$((count + 1))
    done
    
    log_error "前端服务启动超时"
    return 1
}

# 函数：健康检查
health_check() {
    log_info "🧪 执行健康检查..."
    
    # 检查后端
    if curl -s http://localhost:3001/ >/dev/null 2>&1; then
        log_success "✅ 后端服务正常 (http://localhost:3001)"
    else
        log_error "❌ 后端服务异常"
        return 1
    fi
    
    # 检查前端
    if curl -s http://localhost:3002/ >/dev/null 2>&1; then
        log_success "✅ 前端服务正常 (http://localhost:3002)"
    else
        log_error "❌ 前端服务异常"
        return 1
    fi
    
    log_success "🎉 所有服务健康检查通过！"
    return 0
}

# 函数：显示服务状态
show_status() {
    log_info "📊 服务状态:"
    
    # 显示进程
    echo "进程信息:"
    ps aux | grep -E "(node.*index\.js|npm.*dev)" | grep -v grep | while read line; do
        echo "  $line"
    done
    
    # 显示端口
    echo -e "\n端口占用:"
    lsof -i :3001 2>/dev/null | grep LISTEN || echo "  端口3001: 未占用"
    lsof -i :3002 2>/dev/null | grep LISTEN || echo "  端口3002: 未占用"
    
    # 显示日志文件
    echo -e "\n日志文件:"
    if [ -f "$BACKEND_DIR/server.log" ]; then
        echo "  后端日志: $BACKEND_DIR/server.log"
    fi
    if [ -f "$FRONTEND_DIR/client.log" ]; then
        echo "  前端日志: $FRONTEND_DIR/client.log"
    fi
}

# 主函数
main() {
    # 1. 清理进程
    cleanup_processes
    
    # 2. 等待端口释放
    wait_for_port_release 3001 "后端"
    wait_for_port_release 3002 "前端"
    
    # 3. 启动后端
    if ! start_backend; then
        log_error "后端启动失败"
        exit 1
    fi
    
    # 4. 启动前端
    if ! start_frontend; then
        log_error "前端启动失败"
        exit 1
    fi
    
    # 5. 健康检查
    if ! health_check; then
        log_error "健康检查失败"
        exit 1
    fi
    
    # 6. 显示状态
    show_status
    
    log_success "🎉 胶片管理系统启动完成！"
    echo ""
    echo "🌐 访问地址:"
    echo "  前端: http://localhost:3002"
    echo "  后端: http://localhost:3001"
    echo ""
    echo "📝 查看日志:"
    echo "  tail -f $BACKEND_DIR/server.log"
    echo "  tail -f $FRONTEND_DIR/client.log"
    echo ""
    echo "🛑 停止服务: ./stop-services.sh"
}

# 执行主函数
main "$@"
