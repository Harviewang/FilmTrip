#!/bin/bash

# 测试环境快速部署脚本
# 用于快速部署到 filmtrip.imhw.top (Vercel)

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

# 检查Git状态
check_git_status() {
    log_section "📋 检查Git状态"
    
    if [ ! -d ".git" ]; then
        log_error "未找到Git仓库"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "有未提交的更改"
        echo "未提交的文件:"
        git status --short
        echo ""
        read -p "是否继续部署？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    else
        log_success "Git工作目录干净"
    fi
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "当前分支: $CURRENT_BRANCH"
    
    if [ "$CURRENT_BRANCH" != "main" ]; then
        log_warning "当前不在main分支，建议切换到main分支后再部署"
        read -p "是否继续？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    fi
}

# 检查Vercel CLI
check_vercel_cli() {
    log_section "🔍 检查Vercel CLI"
    
    if ! check_command vercel; then
        log_error "Vercel CLI未安装"
        log_info "安装命令: npm install -g vercel"
        log_info "或访问: https://vercel.com/docs/cli"
        exit 1
    fi
    
    log_success "Vercel CLI已安装: $(vercel --version)"
    
    # 检查是否已登录
    if ! vercel whoami &> /dev/null; then
        log_warning "未登录Vercel，正在登录..."
        vercel login
    else
        log_success "已登录Vercel: $(vercel whoami)"
    fi
}

# 部署后端
deploy_backend() {
    log_section "🚀 部署后端到Vercel"
    
    if [ ! -d "backend" ]; then
        log_error "未找到backend目录"
        exit 1
    fi
    
    cd backend
    
    log_info "当前目录: $(pwd)"
    log_info "开始部署后端..."
    
    # 检查环境变量文件
    if [ ! -f ".env" ] && [ -f "env.example" ]; then
        log_warning "未找到.env文件"
        log_info "请确保在Vercel项目设置中配置了环境变量"
        read -p "是否继续？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    fi
    
    # 部署到Vercel
    log_info "执行: vercel --prod"
    vercel --prod
    
    log_success "后端部署完成！"
    log_info "后端URL: https://api.filmtrip.imhw.top"
    
    cd ..
}

# 部署前端
deploy_frontend() {
    log_section "🚀 部署前端到Vercel"
    
    if [ ! -d "frontend" ]; then
        log_error "未找到frontend目录"
        exit 1
    fi
    
    cd frontend
    
    log_info "当前目录: $(pwd)"
    log_info "开始部署前端..."
    
    # 检查环境变量文件
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        log_warning "未找到.env文件"
        log_info "请确保在Vercel项目设置中配置了环境变量"
        read -p "是否继续？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    fi
    
    # 部署到Vercel
    log_info "执行: vercel --prod"
    vercel --prod
    
    log_success "前端部署完成！"
    log_info "前端URL: https://filmtrip.imhw.top"
    
    cd ..
}

# 验证部署
verify_deployment() {
    log_section "✅ 验证部署"
    
    log_info "等待5秒后验证..."
    sleep 5
    
    # 验证后端
    log_info "验证后端: https://api.filmtrip.imhw.top/api/health"
    if curl -s -o /dev/null -w "%{http_code}" "https://api.filmtrip.imhw.top/api/health" | grep -q "200"; then
        log_success "后端API正常"
    else
        log_warning "后端API可能还未生效，请稍后手动验证"
    fi
    
    # 验证前端
    log_info "验证前端: https://filmtrip.imhw.top"
    if curl -s -o /dev/null -w "%{http_code}" "https://filmtrip.imhw.top" | grep -q "200"; then
        log_success "前端页面正常"
    else
        log_warning "前端页面可能还未生效，请稍后手动验证"
    fi
}

# 显示部署信息
show_deployment_info() {
    log_section "📊 部署信息"
    
    echo "测试环境访问地址:"
    echo "  🌐 前端: https://filmtrip.imhw.top"
    echo "  🔌 后端: https://api.filmtrip.imhw.top"
    echo ""
    echo "Vercel项目:"
    echo "  - 前端项目: frontend"
    echo "  - 后端项目: backend"
    echo ""
    echo "后续操作:"
    echo "  1. 访问 https://filmtrip.imhw.top 验证前端"
    echo "  2. 访问 https://api.filmtrip.imhw.top/api/health 验证后端"
    echo "  3. 测试又拍云上传功能"
    echo "  4. 检查日志是否有错误"
    echo ""
    log_info "详细测试清单请参考: docs/deployment/test-environment-setup.md"
}

# 主函数
main() {
    echo ""
    log_section "🚀 FilmTrip 测试环境部署工具"
    echo ""
    log_info "目标环境: filmtrip.imhw.top (Vercel)"
    echo ""
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 检查Git状态
    check_git_status
    
    # 检查Vercel CLI
    check_vercel_cli
    
    # 询问部署选项
    echo ""
    log_info "请选择部署选项:"
    echo "  1) 只部署后端"
    echo "  2) 只部署前端"
    echo "  3) 部署前后端（推荐）"
    echo "  4) 取消"
    echo ""
    read -p "请选择 (1-4): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            deploy_frontend
            verify_deployment
            ;;
        4)
            log_info "部署已取消"
            exit 0
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
    
    # 显示部署信息
    show_deployment_info
    
    log_section "✅ 部署完成！"
    echo ""
}

# 执行主函数
main "$@"

