#!/bin/bash

# 多窗口开发环境启动脚本
# 使用方法: ./start-multi-windows.sh
# 适用于所有终端类型

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="胶片管理系统"
BACKEND_PORT=3001
FRONTEND_PORT=3002

echo -e "${BLUE}🚀 启动多窗口开发环境: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}📁 项目目录: $(pwd)${NC}"

# 创建日志目录
mkdir -p logs

# 清理端口
cleanup_ports() {
    echo -e "${BLUE}🧹 清理端口占用...${NC}"
    
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口 $BACKEND_PORT 已被占用，正在清理...${NC}"
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口 $FRONTEND_PORT 已被占用，正在清理...${NC}"
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# 显示开发环境配置
show_dev_setup() {
    echo -e ""
    echo -e "${GREEN}🎉 多窗口开发环境配置完成！${NC}"
    echo -e ""
    echo -e "${BLUE}📊 开发环境配置:${NC}"
    echo -e "  后端端口: $BACKEND_PORT"
    echo -e "  前端端口: $FRONTEND_PORT"
    echo -e "  数据库: database.sqlite"
    echo -e ""
    echo -e "${BLUE}🪟 请手动创建以下终端窗口:${NC}"
    echo -e ""
    echo -e "${CYAN}1. 📁 项目管理终端${NC}"
    echo -e "   命令: cd '$(pwd)'"
    echo -e "   用途: Git操作、项目管理、服务控制"
    echo -e "   💡 推荐命令:"
    echo -e "      ./start-background.sh  # 后台启动所有服务"
    echo -e "      ./stop-services.sh     # 停止所有服务"
    echo -e "      git status            # 查看Git状态"
    echo -e ""
    echo -e "${CYAN}2. 🔧 后端开发终端${NC}"
    echo -e "   命令: cd '$(pwd)/backend'"
    echo -e "   用途: Node.js后端开发、API测试"
    echo -e "   💡 推荐命令:"
    echo -e "      npm run dev           # 开发模式（如果package.json中有dev脚本）"
    echo -e "      node index.js         # 直接运行"
    echo -e "      tail -f ../logs/backend.log  # 监控日志"
    echo -e ""
    echo -e "${CYAN}3. 🎨 前端开发终端${NC}"
    echo -e "   命令: cd '$(pwd)/frontend'"
    echo -e "   用途: React前端开发、样式调整"
    echo -e "   💡 推荐命令:"
    echo -e "      npm run dev           # 开发模式"
    echo -e "      npm run build         # 构建生产版本"
    echo -e "      tail -f ../logs/frontend.log  # 监控日志"
    echo -e ""
    echo -e "${CYAN}4. 🗄️ 数据库监控终端${NC}"
    echo -e "   命令: cd '$(pwd)'"
    echo -e "   用途: 数据库状态监控、日志查看"
    echo -e "   💡 推荐命令:"
    echo -e "      tail -f logs/backend.log      # 监控后端日志"
    echo -e "      sqlite3 database.sqlite .tables  # 查看数据库表"
    echo -e "      watch -n 2 'ls -la database.sqlite'  # 监控数据库文件变化"
    echo -e ""
    echo -e "${CYAN}5. 📊 日志监控终端${NC}"
    echo -e "   命令: cd '$(pwd)'"
    echo -e "   用途: 前后端日志实时监控"
    echo -e "   💡 推荐命令:"
    echo -e "      tail -f logs/backend.log logs/frontend.log  # 同时监控"
    echo -e "      grep -i error logs/*.log                    # 搜索错误"
    echo -e "      grep -i warning logs/*.log                  # 搜索警告"
    echo -e ""
    echo -e "${BLUE}🚀 快速启动命令:${NC}"
    echo -e "  后台启动所有服务: ./start-background.sh"
    echo -e "  停止所有服务: ./stop-services.sh"
    echo -e "  检查服务状态: ./check-status.sh"
    echo -e ""
    echo -e "${BLUE}💡 开发工作流建议:${NC}"
    echo -e "  1. 在'项目管理'终端中启动所有服务"
    echo -e "  2. 在'后端开发'终端中进行API开发和测试"
    echo -e "  3. 在'前端开发'终端中进行UI开发和调试"
    echo -e "  4. 在'数据库监控'终端中监控数据变化"
    echo -e "  5. 在'日志监控'终端中实时查看错误和警告"
    echo -e ""
    echo -e "${PURPLE}🌟 享受高效的并行开发体验！${NC}"
    echo -e ""
    echo -e "${YELLOW}💡 提示: 使用 Cmd+T (macOS) 或 Ctrl+Shift+T (Linux) 创建新标签页${NC}"
}

# 检查后端package.json中的脚本
check_backend_scripts() {
    if [ -f "backend/package.json" ]; then
        echo -e "${BLUE}📋 后端可用脚本:${NC}"
        cd backend
        npm run 2>/dev/null | grep -E "^  [a-zA-Z]" | head -10 || echo "  无可用脚本"
        cd ..
        echo ""
    fi
}

# 检查前端package.json中的脚本
check_frontend_scripts() {
    if [ -f "frontend/package.json" ]; then
        echo -e "${BLUE}📋 前端可用脚本:${NC}"
        cd frontend
        npm run 2>/dev/null | grep -E "^  [a-zA-Z]" | head -10 || echo "  无可用脚本"
        cd ..
        echo ""
    fi
}

# 主函数
main() {
    cleanup_ports
    check_backend_scripts
    check_frontend_scripts
    show_dev_setup
}

# 运行主函数
main
