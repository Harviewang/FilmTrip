#!/bin/bash

# 多Tab开发环境启动脚本
# 使用方法: ./start-dev-tabs.sh
# 需要安装 iTerm2 或使用 macOS 默认终端

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

echo -e "${BLUE}🚀 启动多Tab开发环境: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}📁 项目目录: $(pwd)${NC}"

# 检查是否安装了iTerm2
if command -v osascript >/dev/null 2>&1; then
    TERMINAL_TYPE="iterm"
    echo -e "${GREEN}✅ 检测到 iTerm2，将使用多Tab模式${NC}"
else
    TERMINAL_TYPE="default"
    echo -e "${YELLOW}⚠️  未检测到 iTerm2，将使用默认终端${NC}"
fi

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

# 使用iTerm2创建多Tab
start_iterm_tabs() {
    echo -e "${BLUE}🔧 在 iTerm2 中创建开发环境...${NC}"
    
    # 创建主Tab（项目管理）
    osascript <<EOF
tell application "iTerm2"
    activate
    set newWindow to (create window with default profile)
    set newTab to current tab of newWindow
    set name of newTab to "📁 项目管理"
    write text "cd '$(pwd)' && echo '🚀 项目管理终端' && echo '📊 可用命令:' && echo '  ./start-background.sh - 后台启动所有服务' && echo '  ./stop-services.sh - 停止所有服务' && echo '  git status - 查看Git状态' && echo '  git log --oneline - 查看提交历史' && echo '' && echo '💡 提示: 在其他Tab中开发，这里用于项目管理'"
end tell
EOF

    # 创建后端开发Tab
    osascript <<EOF
tell application "iTerm2"
    set newTab to (create tab with default profile)
    set name of newTab to "🔧 后端开发"
    write text "cd '$(pwd)/backend' && echo '🔧 后端开发环境' && echo '📊 端口: $BACKEND_PORT' && echo '📝 日志: ../logs/backend.log' && echo '' && echo '🚀 启动后端服务:' && echo '  npm run dev  # 开发模式' && echo '  node index.js  # 生产模式' && echo '' && echo '📊 监控日志:' && echo '  tail -f ../logs/backend.log' && echo '' && echo '🔄 重启服务: Ctrl+C 然后重新运行启动命令'"
end tell
EOF

    # 创建前端开发Tab
    osascript <<EOF
tell application "iTerm2"
    set newTab to (create tab with default profile)
    set name of newTab to "🎨 前端开发"
    write text "cd '$(pwd)/frontend' && echo '🎨 前端开发环境' && echo '📊 端口: $FRONTEND_PORT' && echo '📝 日志: ../logs/frontend.log' && echo '' && echo '🚀 启动前端服务:' && echo '  npm run dev  # 开发模式' && echo '  npm run build  # 构建生产版本' && echo '' && echo '📊 监控日志:' && echo '  tail -f ../logs/frontend.log' && echo '' && echo '🔄 热重载: 修改代码后自动刷新'"
end tell
EOF

    # 创建数据库监控Tab
    osascript <<EOF
tell application "iTerm2"
    set newTab to (create tab with default profile)
    set name of newTab to "🗄️ 数据库监控"
    write text "cd '$(pwd)' && echo '🗄️ 数据库监控环境' && echo '📊 数据库文件: database.sqlite' && echo '📝 后端日志: logs/backend.log' && echo '' && echo '📊 监控后端日志:' && echo '  tail -f logs/backend.log' && echo '' && echo '🔍 查看数据库:' && echo '  sqlite3 database.sqlite .tables  # 查看表' && echo '  sqlite3 database.sqlite .schema  # 查看结构' && echo '' && echo '📈 实时监控:' && echo '  watch -n 2 'ls -la database.sqlite'  # 监控文件变化'"
end tell
EOF

    # 创建日志监控Tab
    osascript <<EOF
tell application "iTerm2"
    set newTab to (create tab with default profile)
    set name of newTab to "📊 日志监控"
    write text "cd '$(pwd)' && echo '📊 日志监控环境' && echo '📝 后端日志: logs/backend.log' && echo '📝 前端日志: logs/frontend.log' && echo '' && echo '📊 同时监控前后端日志:' && echo '  tail -f logs/backend.log logs/frontend.log' && echo '' && echo '📊 只监控后端日志:' && echo '  tail -f logs/backend.log' && echo '' && echo '📊 只监控前端日志:' && echo '  tail -f logs/frontend.log' && echo '' && echo '🔍 搜索错误:' && echo '  grep -i error logs/*.log' && echo '  grep -i warning logs/*.log'"
end tell
EOF

    echo -e "${GREEN}✅ 已在 iTerm2 中创建了5个开发Tab:${NC}"
    echo -e "  📁 项目管理 - Git操作和项目管理"
    echo -e "  🔧 后端开发 - Node.js后端开发"
    echo -e "  🎨 前端开发 - React前端开发"
    echo -e "  🗄️ 数据库监控 - 数据库状态监控"
    echo -e "  📊 日志监控 - 前后端日志监控"
}

# 使用默认终端创建多窗口
start_default_terminal() {
    echo -e "${BLUE}🔧 在默认终端中创建开发环境...${NC}"
    
    echo -e "${YELLOW}⚠️  默认终端不支持自动创建多Tab${NC}"
    echo -e "${BLUE}📋 请手动创建以下终端窗口:${NC}"
    echo -e ""
    echo -e "${CYAN}1. 📁 项目管理终端:${NC}"
    echo -e "   命令: cd '$(pwd)'"
    echo -e "   用途: Git操作、项目管理、服务控制"
    echo -e ""
    echo -e "${CYAN}2. 🔧 后端开发终端:${NC}"
    echo -e "   命令: cd '$(pwd)/backend'"
    echo -e "   用途: Node.js后端开发、API测试"
    echo -e ""
    echo -e "${CYAN}3. 🎨 前端开发终端:${NC}"
    echo -e "   命令: cd '$(pwd)/frontend'"
    echo -e "   用途: React前端开发、样式调整"
    echo -e ""
    echo -e "${CYAN}4. 🗄️ 数据库监控终端:${NC}"
    echo -e "   命令: cd '$(pwd)'"
    echo -e "   用途: 数据库状态监控、日志查看"
    echo -e ""
    echo -e "${CYAN}5. 📊 日志监控终端:${NC}"
    echo -e "   命令: cd '$(pwd)'"
    echo -e "   用途: 前后端日志实时监控"
}

# 显示开发环境信息
show_dev_info() {
    echo -e ""
    echo -e "${GREEN}🎉 多Tab开发环境已准备就绪！${NC}"
    echo -e ""
    echo -e "${BLUE}📊 开发环境配置:${NC}"
    echo -e "  后端端口: $BACKEND_PORT"
    echo -e "  前端端口: $FRONTEND_PORT"
    echo -e "  数据库: database.sqlite"
    echo -e ""
    echo -e "${BLUE}🚀 快速启动命令:${NC}"
    echo -e "  后台启动所有服务: ./start-background.sh"
    echo -e "  停止所有服务: ./stop-services.sh"
    echo -e "  检查服务状态: ./check-status.sh"
    echo -e ""
    echo -e "${BLUE}💡 开发建议:${NC}"
    echo -e "  • 在'后端开发'Tab中运行: npm run dev"
    echo -e "  • 在'前端开发'Tab中运行: npm run dev"
    echo -e "  • 在'日志监控'Tab中运行: tail -f logs/*.log"
    echo -e "  • 在'项目管理'Tab中进行Git操作"
    echo -e ""
    echo -e "${PURPLE}🌟 享受高效的并行开发体验！${NC}"
}

# 主函数
main() {
    cleanup_ports
    
    if [ "$TERMINAL_TYPE" = "iterm" ]; then
        start_iterm_tabs
    else
        start_default_terminal
    fi
    
    show_dev_info
}

# 运行主函数
main
