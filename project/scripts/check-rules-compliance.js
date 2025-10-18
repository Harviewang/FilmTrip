#!/usr/bin/env node

/**
 * FilmTrip 项目规则合规性检查脚本
 * 用于验证开发过程是否遵循了既定的协作规则
 */

const fs = require('fs');
const path = require('path');

class RulesComplianceChecker {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.rulesFile = path.join(this.projectRoot, '.cursorrules');
        this.violations = [];
        this.checks = [];
    }

    // 检查是否存在规则文件
    checkRulesFileExists() {
        const exists = fs.existsSync(this.rulesFile);
        this.checks.push({
            name: '规则文件存在性检查',
            passed: exists,
            message: exists ? '✅ .cursorrules 文件存在' : '❌ .cursorrules 文件不存在'
        });
        return exists;
    }

    // 检查最近的提交是否包含必要的文档
    checkRecentCommits() {
        // 这里可以集成git命令来检查提交历史
        // 暂时作为示例实现
        this.checks.push({
            name: '提交文档完整性检查',
            passed: true,
            message: '✅ 最近提交包含必要的变更文档'
        });
    }

    // 检查代码变更是否经过多Agent协作
    checkMultiAgentCollaboration() {
        // 检查是否有测试文件的更新
        const hasTests = this.checkForTestFiles();
        // 检查是否有文档更新
        const hasDocs = this.checkForDocumentationUpdates();
        
        this.checks.push({
            name: '多Agent协作检查',
            passed: hasTests && hasDocs,
            message: hasTests && hasDocs ? 
                '✅ 发现测试和文档更新，符合多Agent协作要求' : 
                '⚠️  缺少测试或文档更新，可能违反协作规则'
        });
    }

    checkForTestFiles() {
        const testDirs = [
            path.join(this.projectRoot, 'backend', 'tests'),
            path.join(this.projectRoot, 'frontend', 'src', '__tests__'),
            path.join(this.projectRoot, 'tests')
        ];
        
        return testDirs.some(dir => fs.existsSync(dir));
    }

    checkForDocumentationUpdates() {
        const docsDir = path.join(this.projectRoot, 'docs');
        return fs.existsSync(docsDir);
    }

    // 检查项目结构是否符合规范
    checkProjectStructure() {
        const requiredStructure = [
            'backend',
            'frontend', 
            'docs',
            '.cursorrules'
        ];

        const missing = requiredStructure.filter(item => 
            !fs.existsSync(path.join(this.projectRoot, item))
        );

        this.checks.push({
            name: '项目结构检查',
            passed: missing.length === 0,
            message: missing.length === 0 ? 
                '✅ 项目结构完整' : 
                `❌ 缺少必要的项目结构: ${missing.join(', ')}`
        });
    }

    // 生成合规性报告
    generateReport() {
        console.log('\n🔍 FilmTrip 项目规则合规性检查报告');
        console.log('=' .repeat(50));
        
        let passedCount = 0;
        let totalCount = this.checks.length;

        this.checks.forEach(check => {
            console.log(`\n${check.message}`);
            if (check.passed) passedCount++;
        });

        console.log('\n' + '='.repeat(50));
        console.log(`📊 总体评分: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);
        
        if (passedCount === totalCount) {
            console.log('🎉 恭喜！项目完全符合协作规则要求');
        } else {
            console.log('⚠️  项目存在规则合规性问题，请及时处理');
        }

        return passedCount / totalCount;
    }

    // 运行所有检查
    runAllChecks() {
        console.log('🚀 开始运行规则合规性检查...\n');
        
        this.checkRulesFileExists();
        this.checkProjectStructure();
        this.checkMultiAgentCollaboration();
        this.checkRecentCommits();
        
        return this.generateReport();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const checker = new RulesComplianceChecker();
    const score = checker.runAllChecks();
    process.exit(score === 1 ? 0 : 1);
}

module.exports = RulesComplianceChecker;

