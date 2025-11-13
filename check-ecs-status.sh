#!/bin/bash

# ECS服务器状态检查脚本
# 用于部署前检查服务器资源、服务状态、环境配置等

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_section() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

# 检查命令是否存在
check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 检查远程服务器（通过SSH）
check_remote_server() {
    local HOST=$1
    local USER=${2:-root}
    local PORT=${3:-22}
    
    log_section "🔍 检查远程服务器: $USER@$HOST:$PORT"
    
    # 检查SSH连接
    if ! ssh -p $PORT -o ConnectTimeout=5 -o BatchMode=yes $USER@$HOST "echo 'SSH连接成功'" &> /dev/null; then
        log_error "无法连接到服务器 $HOST"
        log_warning "请确认："
        echo "  1. SSH密钥已配置"
        echo "  2. 服务器IP地址正确"
        echo "  3. 防火墙允许SSH连接（端口 $PORT）"
        return 1
    fi
    
    log_success "SSH连接成功"
    
    # 执行远程检查
    ssh -p $PORT $USER@$HOST << 'EOF'
        # 颜色定义
        RED='\033[0;31m'
        GREEN='\033[0;32m'
        YELLOW='\033[1;33m'
        BLUE='\033[0;34m'
        NC='\033[0m'
        
        log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
        log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
        log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
        log_error() { echo -e "${RED}[✗]${NC} $1"; }
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📊 服务器基本信息"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # 系统信息
        echo "操作系统:"
        cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2 || uname -a
        echo ""
        
        # 系统时间
        echo "系统时间:"
        date
        echo ""
        
        # 系统负载
        echo "系统负载:"
        uptime
        echo ""
        
        # CPU使用率
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "💻 CPU使用率"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if command -v top &> /dev/null; then
            top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print "CPU使用率: " $1 "%"}'
        else
            log_warning "top命令不可用，无法检查CPU使用率"
        fi
        echo ""
        
        # 内存使用情况
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🧠 内存使用情况"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if command -v free &> /dev/null; then
            free -h
            MEM_TOTAL=$(free | grep Mem | awk '{print $2}')
            MEM_USED=$(free | grep Mem | awk '{print $3}')
            MEM_USAGE=$(awk "BEGIN {printf \"%.1f\", ($MEM_USED/$MEM_TOTAL)*100}")
            if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
                log_error "内存使用率过高: ${MEM_USAGE}%"
            elif (( $(echo "$MEM_USAGE > 60" | bc -l) )); then
                log_warning "内存使用率较高: ${MEM_USAGE}%"
            else
                log_success "内存使用率正常: ${MEM_USAGE}%"
            fi
        else
            log_warning "free命令不可用，无法检查内存"
        fi
        echo ""
        
        # 磁盘使用情况
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "💾 磁盘使用情况"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if command -v df &> /dev/null; then
            df -h | grep -E '^/dev/|Filesystem'
            DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
            DISK_AVAILABLE=$(df / | tail -1 | awk '{print $4}')
            if [ "$DISK_USAGE" -gt 80 ]; then
                log_error "磁盘使用率过高: ${DISK_USAGE}% (可用: ${DISK_AVAILABLE})"
            elif [ "$DISK_USAGE" -gt 60 ]; then
                log_warning "磁盘使用率较高: ${DISK_USAGE}% (可用: ${DISK_AVAILABLE})"
            else
                log_success "磁盘使用率正常: ${DISK_USAGE}% (可用: ${DISK_AVAILABLE})"
            fi
            if [ "$DISK_USAGE" -gt 90 ] || [ -z "$DISK_AVAILABLE" ]; then
                log_error "⚠️  磁盘空间严重不足，部署可能失败！"
            fi
        else
            log_warning "df命令不可用，无法检查磁盘"
        fi
        echo ""
        
        # Node.js环境
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🟢 Node.js环境"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if command -v node &> /dev/null; then
            NODE_VERSION=$(node -v)
            NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
            log_success "Node.js版本: $NODE_VERSION"
            if [ "$NODE_MAJOR" -lt 18 ]; then
                log_warning "Node.js版本过低，建议 >= 18"
            fi
        else
            log_error "Node.js未安装"
        fi
        
        if command -v npm &> /dev/null; then
            NPM_VERSION=$(npm -v)
            log_success "npm版本: $NPM_VERSION"
        else
            log_error "npm未安装"
        fi
        echo ""
        
        # 运行中的Node.js进程
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "⚙️  运行中的Node.js进程"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if pgrep -f node > /dev/null; then
            ps aux | grep -E 'node|npm' | grep -v grep || log_warning "未找到Node.js进程"
        else
            log_warning "未发现运行中的Node.js进程"
        fi
        echo ""
        
        # PM2进程（如果使用PM2）
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📦 PM2进程（如果使用）"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if command -v pm2 &> /dev/null; then
            pm2 list || log_warning "PM2未运行或无进程"
        else
            log_info "未安装PM2或未使用PM2"
        fi
        echo ""
        
        # 端口占用情况
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔌 端口占用情况"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        PORTS=(3001 3002 80 443)
        for port in "${PORTS[@]}"; do
            if command -v lsof &> /dev/null; then
                if lsof -i :$port > /dev/null 2>&1; then
                    PROCESS=$(lsof -ti :$port | head -1)
                    PROCESS_NAME=$(ps -p $PROCESS -o comm= 2>/dev/null || echo "未知")
                    log_warning "端口 $port 被占用 (PID: $PROCESS, 进程: $PROCESS_NAME)"
                else
                    log_success "端口 $port 空闲"
                fi
            elif command -v netstat &> /dev/null; then
                if netstat -tuln | grep -q ":$port "; then
                    log_warning "端口 $port 被占用"
                else
                    log_success "端口 $port 空闲"
                fi
            else
                log_warning "无法检查端口占用（需要lsof或netstat）"
            fi
        done
        echo ""
        
        # 网络连接
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🌐 网络连接"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
            log_success "外网连接正常"
        else
            log_error "外网连接失败"
        fi
        echo ""
        
        # 项目目录检查
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📁 项目目录检查"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        PROJECT_DIRS=(
            "/root/FilmTrip"
            "/home/$(whoami)/FilmTrip"
            "/var/www/filmtrip"
            "$(pwd)"
        )
        for dir in "${PROJECT_DIRS[@]}"; do
            if [ -d "$dir" ]; then
                log_success "找到项目目录: $dir"
                echo "  目录大小: $(du -sh $dir 2>/dev/null | cut -f1)"
                echo "  最后修改: $(stat -c %y $dir 2>/dev/null | cut -d' ' -f1 || stat -f %Sm $dir 2>/dev/null || echo '未知')"
                if [ -f "$dir/backend/.env" ]; then
                    log_success "  找到 backend/.env"
                else
                    log_warning "  未找到 backend/.env"
                fi
                if [ -f "$dir/frontend/package.json" ]; then
                    log_success "  找到 frontend/package.json"
                else
                    log_warning "  未找到 frontend/package.json"
                fi
                break
            fi
        done
        echo ""
        
EOF
}

# 检查本地服务器（当前机器）
check_local_server() {
    log_section "🔍 检查本地服务器"
    
    # 系统信息
    log_info "操作系统: $(uname -a)"
    log_info "系统时间: $(date)"
    log_info "系统负载: $(uptime)"
    echo ""
    
    # CPU使用率
    log_section "💻 CPU使用率"
    if check_command top; then
        top -bn1 | grep "Cpu(s)" | awk '{print "CPU使用率: " $2}'
    else
        log_warning "top命令不可用"
    fi
    echo ""
    
    # 内存使用情况
    log_section "🧠 内存使用情况"
    if check_command free; then
        free -h
    else
        log_warning "free命令不可用"
    fi
    echo ""
    
    # 磁盘使用情况
    log_section "💾 磁盘使用情况"
    if check_command df; then
        df -h
    else
        log_warning "df命令不可用"
    fi
    echo ""
    
    # Node.js环境
    log_section "🟢 Node.js环境"
    if check_command node; then
        log_success "Node.js版本: $(node -v)"
    else
        log_error "Node.js未安装"
    fi
    
    if check_command npm; then
        log_success "npm版本: $(npm -v)"
    else
        log_error "npm未安装"
    fi
    echo ""
}

# 主函数
main() {
    echo ""
    log_section "🚀 ECS服务器状态检查工具"
    echo ""
    
    # 检查参数
    if [ $# -eq 0 ]; then
        # 本地检查
        check_local_server
    else
        # 远程检查
        HOST=$1
        USER=${2:-root}
        PORT=${3:-22}
        check_remote_server $HOST $USER $PORT
    fi
    
    log_section "✅ 检查完成"
    echo ""
    log_info "如果发现问题，请先解决后再部署！"
    echo ""
}

# 显示帮助
show_help() {
    echo "用法: $0 [SSH_HOST] [SSH_USER] [SSH_PORT]"
    echo ""
    echo "示例:"
    echo "  $0                                    # 检查本地服务器"
    echo "  $0 192.168.1.100                     # 检查远程服务器（默认用户: root, 端口: 22）"
    echo "  $0 192.168.1.100 ubuntu              # 检查远程服务器（指定用户）"
    echo "  $0 192.168.1.100 ubuntu 2222         # 检查远程服务器（指定用户和端口）"
    echo ""
    echo "注意:"
    echo "  - 需要配置SSH密钥认证（无密码登录）"
    echo "  - 或者使用 ssh-agent 管理密钥"
    echo ""
}

# 执行主函数
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

main "$@"

