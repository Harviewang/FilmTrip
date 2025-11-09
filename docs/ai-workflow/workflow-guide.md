# FilmTrip AI 工作流指南

> **用途**: AI助手日常工作的快速参考和流程指引  
> **适用对象**: 所有AI Agent角色  
> **版本**: v2.0

---

## 🚀 快速开始

### 1. 接到用户需求
```bash
用户: [描述需求]
↓
@planner: 我来分析这个需求... [使用模板A]
↓
@architect: 从技术角度评估... [使用模板B]
↓
@reviewer: 审查需求理解准确性...
↓
用户确认后 → 开始执行
```

### 2. 直接开始模式（推荐）
```
用户: [描述需求]
AI自动按.cursorrules规则响应
```

### 3. 可选检查（非必须）
```bash
./project/scripts/start-session.sh  # 检查规则配置
```

---

## 📋 6阶段标准流程

### 阶段1: 需求接收与分析 [THINK]
**执行者**: @planner + @architect  
**输出**: 需求分析报告 + 技术方案  
**模板**: [模板A - 需求分析](./templates/template-a-demand-analysis.md) | [模板B - 技术方案](./templates/template-b-solution-design.md)

**关键要点**:
- 深度分析用户需求
- 明确功能边界
- 评估技术可行性
- 识别风险和约束

---

### 阶段2: 方案确认 [CONFIRM]
**执行者**: 用户  
**输出**: 用户确认清单  
**模板**: [模板C - 用户确认](./templates/template-c-user-confirmation.md)

**关键要点**:
- 功能需求理解正确
- 技术方案合理可行
- 时间安排可接受
- 质量标准明确

---

### 阶段3: 分工执行 [ACT]
**执行者**: 相关Agent  
**输出**: 代码实现 + 自查报告  
**模板**: [模板D - 任务分配](./templates/template-d-task-allocation.md) | [模板E - 自查报告](./templates/template-e-self-check.md)

**⚠️ 自测验证要求**:
1. **代码试运行**: 确保语法正确
2. **功能测试**: 验证功能正常
3. **MCP网页测试**: 使用MCP工具测试
4. **接口调用测试**: 验证API正常
5. **用户体验验证**: 确保可用

**关键要点**:
- 按职责边界执行
- 完成后立即自查
- 提交自查报告

---

### 阶段4: 交叉审查 [VALIDATE]
**执行者**: @reviewer + @tester  
**输出**: 质量审查报告  
**模板**: [模板F - 质量审查](./templates/template-f-quality-review.md)

**关键要点**:
- 检查需求满足度
- 审查代码质量
- 验证测试覆盖
- 发现改进点

---

### 阶段5: 用户验收 [USER ACCEPTANCE]
**执行者**: 用户 + @reviewer  
**输出**: 用户验收报告  
**模板**: [模板G - 用户验收](./templates/template-g-user-acceptance.md)

**关键要点**:
- 核心功能验收
- 用户体验验证
- 性能表现测试
- 问题反馈收集

---

### 阶段6: 总结归档 [SUMMARIZE]
**执行者**: @documenter + @reviewer  
**输出**: 项目总结报告 + 知识沉淀  
**模板**: [模板H - 项目总结](./templates/template-h-project-summary.md)

**关键要点**:
- 经验总结提炼
- 知识库更新
- 文档归档
- 改进建议

---

## 👥 9个Agent角色速查

| Agent | 职责 | 主要输出 | 边界 |
|-------|------|----------|------|
| @planner | 需求分析、任务分解 | 需求分析报告、任务清单 | 只规划不实现 |
| @architect | 技术方案、架构设计 | 技术方案、架构图 | 只设计不编码 |
| @backend | 后端开发、API实现 | 后端代码、API文档 | 只做服务端 |
| @frontend | 前端开发、UI实现 | 前端组件、样式文件 | 只做客户端 |
| @database | 数据建模、查询优化 | 数据库脚本、查询语句 | 只做数据层 |
| @tester | 测试验证、质量保证 | 测试用例、测试报告 | 只做测试 |
| @devops | 部署配置、环境管理 | 部署脚本、配置文件 | 只做运维 |
| @reviewer | 质量审查、流程监督 | 审查报告、改进建议 | 只审查不开发 |
| @documenter | 文档编写、知识管理 | 技术文档、总结报告 | 只做文档 |

---

## 📝 8个工作模板速查

### 阶段1: 需求分析
- **模板A**: [需求分析报告](./templates/template-a-demand-analysis.md) - @planner使用
- **模板B**: [技术方案设计](./templates/template-b-solution-design.md) - @architect使用
- **模板C**: [用户确认清单](./templates/template-c-user-confirmation.md) - 用户确认用

### 阶段3: 分工执行
- **模板D**: [任务分配清单](./templates/template-d-task-allocation.md) - 任务分配用
- **模板E**: [Agent自查报告](./templates/template-e-self-check.md) - 各Agent自查用

### 阶段4: 交叉审查
- **模板F**: [质量审查报告](./templates/template-f-quality-review.md) - @reviewer审查用

### 阶段5: 用户验收
- **模板G**: [用户验收报告](./templates/template-g-user-acceptance.md) - 用户验收用

### 阶段6: 总结归档
- **模板H**: [项目总结报告](./templates/template-h-project-summary.md) - @documenter总结用

---

## ⚠️ 自测验证要求（阶段3关键环节）

### 每次改动后的自测步骤
1. **代码试运行**: 确保代码语法正确，无编译错误
2. **功能测试**: 验证修改的功能是否按预期工作
3. **MCP网页测试**: 使用MCP工具测试网页功能
4. **接口调用测试**: 验证API接口正常工作
5. **用户体验验证**: 确保交付给用户的是可用状态

### 自测检查清单
- [ ] 代码无语法错误
- [ ] 功能按预期工作
- [ ] 网页正常加载和交互
- [ ] API接口正常响应
- [ ] 用户体验良好
- [ ] 无控制台错误
- [ ] 响应式设计正常

**重要**: 只有通过自测验证的代码才能交付给用户。

---

## 🚨 质量预警速查

### 预警级别
- **红色预警**: 通过率<80% → 立即停止
- **黄色预警**: 通过率<90% → 需要关注  
- **绿色提醒**: 通过率<95% → 持续改进

### 核心指标
- 需求理解准确率: ≥95%
- 代码质量评分: ≥9分
- 测试覆盖率: ≥95%
- 用户满意度: ≥95%

---

## ✅ 检查清单速查

### Agent自查清单
- @planner: 需求分析自查清单 (5大类25项)
- @architect: 技术方案自查清单 (5大类25项)
- @backend: 后端开发自查清单 (6大类30项)
- @frontend: 前端开发自查清单 (6大类30项)
- @database: 数据库自查清单 (5大类25项)
- @tester: 测试验证自查清单 (6大类30项)

### 交叉审查清单
- @reviewer: 综合质量审查清单 (6大类30项)

### 用户确认清单
- 需求确认清单 (3大类15项)
- 功能验收确认清单 (5大类25项)
- 最终交付确认清单 (4大类20项)

**详细清单**: 查看 [质量检查清单](./quality-checklist.md)

---

## 📊 追踪记录速查

### 3层追踪体系
1. **实时追踪**: 开发过程记录（每30分钟更新）
2. **阶段总结**: 每阶段经验总结（阶段结束时）
3. **项目归档**: 完整知识沉淀（项目完成时）

### 记录频率
- 实时记录: 每30分钟更新
- 阶段总结: 每阶段结束时
- 项目归档: 项目完成时

**详细说明**: 查看 [追踪系统](./tracking-system.md)

---

## 🐞 缺陷管理流程

1. **登记**（@planner）  
   - 用户反馈缺陷后 10 分钟内更新 [缺陷问题清单](./bug-tracker.md)。  
   - 未拿到完整信息时，在“备注”中标明需补充项并持续追踪。
2. **分析与定责**（@architect + 对应开发角色）  
   - 复现问题、划分范围，指派责任人，状态更新为 `已确认`。  
   - 同步相关任务到 `docs/work-plans/` 中的当日计划。
3. **执行修复**（@backend/@frontend 等）  
   - 按 6 阶段流程执行并自查，状态改为 `处理中`。
4. **测试验证**（@tester）  
   - 完成测试并记录结果，状态改为 `待验证`，必要时附测试链接。  
5. **审查与用户确认**（@reviewer + 用户）  
   - 审查修复质量，无误后与用户确认，状态更新为 `已关闭`。  
6. **归档总结**（@documenter）  
   - 每周对已关闭缺陷做经验总结，归档到知识库。

> **强制要求**：所有未闭环的缺陷必须在每日总结中提及，直至 `bug-tracker` 中状态为 `已关闭` 或 `已搁置`。

---

## ❌ 常见错误速查

### 错误的开始方式
```
❌ 用户: 帮我修复bug
   AI: 好的，我直接修改...

✅ 用户: 帮我修复bug  
   @planner: 我来分析这个bug的具体情况...
   [使用需求分析模板A进行深度分析]
```

### 错误的执行方式
```
❌ 单一Agent处理复杂任务
❌ 跳过用户确认环节
❌ 没有自查报告
❌ 跳过质量审查
❌ 没有总结记录

✅ 多Agent协作分工
✅ 关键节点用户确认
✅ 每个Agent自查
✅ @reviewer交叉审查
✅ @documenter总结归档
```

---

## 💡 最佳实践速查

### 会话开始
1. 运行 `./project/scripts/start-session.sh`
2. @planner 使用模板A分析需求
3. @architect 使用模板B设计方案
4. 用户使用模板C确认

### 任务执行
1. 使用模板D分配任务
2. 各Agent使用对应自查清单
3. @reviewer 使用模板F审查
4. 用户使用模板G验收

### 项目结束
1. @documenter 使用模板H总结
2. 更新项目知识库
3. 归档所有记录文档
4. 分析改进机会

---

## 🔧 常用命令速查

### 创建记录文件
```bash
# 实时追踪记录
cp docs/ai-workflow/tracking-system.md logs/tracking-$(date +%Y%m%d-%H%M).md

# 阶段总结记录
cp docs/ai-workflow/tracking-system.md logs/phase-summary-需求分析-$(date +%Y%m%d).md

# 自查报告
cp docs/ai-workflow/quality-checklist.md logs/self-check-backend-$(date +%Y%m%d).md

# 用户确认记录
cp docs/ai-workflow/quality-checklist.md logs/user-confirm-$(date +%Y%m%d).md
```

### 规则合规性检查
```bash
# 运行合规性检查
node project/scripts/check-rules-compliance.js

# 启动标准会话
./project/scripts/start-session.sh
```

---

## 🎯 成功标准速查

### 过程质量
- 需求理解准确率: ≥95%
- 设计方案通过率: ≥90%  
- 一次审查通过率: ≥80%
- 用户确认通过率: ≥95%

### 产品质量
- 功能完整性: 100%
- 代码质量评分: ≥9分
- 性能指标达成: ≥95%
- 测试通过率: ≥95%

### 用户满意度
- 需求满足度: ≥95%
- 体验满意度: ≥90%
- 交付及时性: ≥90%
- 整体满意度: ≥95%

---

**⚠️ 重要提醒**: 
- 这是快速参考，详细内容请查看对应的完整文档
- 所有规则都是强制性的，不可随意省略
- 遇到问题时优先查看完整文档和检查清单
- 持续改进是成功的关键，请积极反馈和优化

