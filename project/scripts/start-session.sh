#!/bin/bash

# FilmTrip 项目标准会话启动脚本
# 确保每个开发会话都遵循统一的交互规则

echo "🚀 FilmTrip 项目会话启动检查"
echo "================================"

# 检查规则文件是否存在
if [ ! -f ".cursorrules" ]; then
    echo "❌ 错误: .cursorrules 文件不存在"
    echo "请确保项目根目录有统一的交互规则文件"
    exit 1
fi

echo "✅ 发现 .cursorrules 文件"

# 检查规则合规性
if [ -f "scripts/check-rules-compliance.js" ]; then
    echo "🔍 运行规则合规性检查..."
    node scripts/check-rules-compliance.js
    if [ $? -ne 0 ]; then
        echo "⚠️  发现合规性问题，建议先解决后再开始开发"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# 显示可用的Agent角色
echo ""
echo "📋 可用的Agent角色："
echo "  @planner    - 项目规划师 [核心角色-负责需求分析和任务分解]"
echo "  @architect  - 系统架构师 [技术方案设计和架构决策]"
echo "  @backend    - 后端开发工程师 [API实现和业务逻辑]"  
echo "  @frontend   - 前端开发工程师 [UI组件和用户交互]"
echo "  @database   - 数据库工程师 [数据建模和查询优化]"
echo "  @tester     - 测试工程师 [质量保证和功能验证]"
echo "  @devops     - 运维工程师 [部署配置和环境管理]"
echo "  @reviewer   - 质量审查专家 [代码审查和质量把关]"
echo "  @documenter - 文档专家 [文档编写和知识管理]"

echo ""
echo "💡 标准工作流程："
echo "  1. 需求分析 (@planner主导) → 用户确认"
echo "  2. 方案设计 (@architect主导) → 用户确认"
echo "  3. 分工执行 (各Agent按职责) → 自查报告"
echo "  4. 交叉审查 (@reviewer主导) → 质量验证"
echo "  5. 用户验收 (用户主导) → 满意度确认"
echo "  6. 总结归档 (@documenter主导) → 知识沉淀"

echo ""
echo "🔒 强制执行规则："
echo "  ✓ 必须以@planner需求分析开始每个会话"
echo "  ✓ 重要决策必须获得用户明确确认"
echo "  ✓ 所有Agent必须完成自查清单"
echo "  ✓ @reviewer必须进行交叉审查"
echo "  ✓ 每个项目必须有完整的总结记录"
echo "  ✓ 禁止跳过任何流程步骤"

echo ""
echo "✨ 会话已准备就绪，请开始你的开发任务！"
echo "================================"
