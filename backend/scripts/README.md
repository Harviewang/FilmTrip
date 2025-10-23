# 后端维护脚本 (Backend Scripts)

本目录包含用于数据维护、修复和管理的后端脚本。

## 📋 脚本清单

### 数据修复类

#### fix-photo-dimensions.js
**功能**: 修复照片的尺寸和方向数据

**使用场景**:
- 历史照片缺少width/height/orientation数据
- 数据库迁移后需要补全数据
- 手动修改过照片文件需要同步到数据库

**运行方式**:
```bash
# 方式1: 使用npm scripts (推荐)
npm run fix-dimensions        # 执行修复
npm run check-dimensions      # 只检查不修复

# 方式2: 直接运行
cd backend
node scripts/fix-photo-dimensions.js         # 执行修复
node scripts/fix-photo-dimensions.js check   # 只检查不修复
node scripts/fix-photo-dimensions.js help    # 显示帮助
```

**输出示例**:
```
=== 照片尺寸和方向数据修复工具 ===

ℹ 正在查询数据库...
ℹ 找到 8 张照片

✓ [1/8] f52f5fbb-5bed-424d-8d55-05bd71736ca8_001.png: 1x1, orientation=1
✓ [2/8] c180f5c5-5118-46fc-b3fc-02b231e46ced_002.JPG: 3637x2433, orientation=1
✓ [3/8] 98e663c6-ebcb-4f80-bf66-044e252c6477_003.JPG: 3637x2433, orientation=8
...

=== 修复完成 ===
总计: 8 张照片
成功: 8
跳过: 0
失败: 0

✓ 所有照片的尺寸数据都已完整!
```

**相关文档**: 
- [照片尺寸和方向问题复盘](../../docs/troubleshooting/照片尺寸和方向问题复盘.md)

---

### 数据迁移类

#### (待添加)
- migrate-film-rolls.js - 胶卷数据迁移
- migrate-exif-data.js - EXIF数据批量导入

### 数据清理类

#### (待添加)
- clean-orphan-files.js - 清理孤立文件(数据库无记录的文件)
- clean-missing-files.js - 清理无效记录(文件不存在的记录)

### 数据检查类

#### (待添加)
- check-data-integrity.js - 数据完整性检查
- check-file-consistency.js - 文件一致性检查

---

## 🎯 脚本开发规范

### 1. 文件命名
- 使用kebab-case命名: `fix-photo-dimensions.js`
- 前缀表示功能类型:
  - `fix-*` - 修复类脚本
  - `migrate-*` - 迁移类脚本
  - `check-*` - 检查类脚本
  - `clean-*` - 清理类脚本

### 2. 功能要求
每个脚本应该:
- ✅ 支持`--help`参数显示帮助信息
- ✅ 支持`--dry-run`或`check`模式(只检查不执行)
- ✅ 提供清晰的进度提示和颜色输出
- ✅ 在开始前显示影响范围
- ✅ 执行后提供详细的结果报告
- ✅ 异常情况有明确的错误提示
- ✅ 支持通过npm scripts调用

### 3. 代码结构
```javascript
// 1. 依赖导入
const path = require('path');

// 2. 配置常量
const colors = { /* ... */ };

// 3. 工具函数
const log = { /* ... */ };

// 4. 核心功能函数
async function mainFunction() { /* ... */ }

// 5. 辅助功能函数
async function checkOnly() { /* ... */ }

// 6. 命令行参数处理
const args = process.argv.slice(2);
if (args[0] === 'check') {
  checkOnly();
} else {
  mainFunction();
}
```

### 4. 输出规范
使用ANSI颜色代码:
```javascript
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',   // 成功
  red: '\x1b[31m',     // 错误
  yellow: '\x1b[33m',  // 警告
  blue: '\x1b[34m',    // 标题
  cyan: '\x1b[36m'     // 信息
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.blue}=== ${msg} ===${colors.reset}\n`)
};
```

### 5. 错误处理
```javascript
try {
  // 主要逻辑
} catch (error) {
  log.error(`操作失败: ${error.message}`);
  console.error(error);
  process.exit(1);
} finally {
  // 清理资源(如关闭数据库连接)
  db.close();
}
```

---

## 📚 添加新脚本

### 步骤

1. **创建脚本文件**
   ```bash
   touch backend/scripts/your-script.js
   chmod +x backend/scripts/your-script.js
   ```

2. **添加npm script**
   编辑`backend/package.json`:
   ```json
   "scripts": {
     "your-command": "node scripts/your-script.js"
   }
   ```

3. **更新文档**
   - 在本文档添加脚本说明
   - 如果是问题修复,在`docs/troubleshooting/`添加复盘文档

4. **测试脚本**
   ```bash
   npm run your-command
   npm run your-command -- --help
   npm run your-command -- --dry-run
   ```

### 模板

```javascript
/**
 * 脚本标题
 * 
 * 功能: 简短描述
 * 使用场景: 
 *   1. 场景一
 *   2. 场景二
 * 
 * 运行方式:
 *   npm run command-name
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.blue}=== ${msg} ===${colors.reset}\n`)
};

async function main() {
  log.title('脚本标题');
  
  try {
    // 你的代码
    log.success('操作完成');
  } catch (error) {
    log.error(`操作失败: ${error.message}`);
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args[0] === 'help' || args[0] === '--help') {
  console.log('帮助信息...');
} else {
  main().catch(console.error);
}
```

---

## 🔗 相关文档

- [问题排查与经验总结](../../docs/troubleshooting/README.md)
- [数据库设计](../../docs/数据库设计.md)
- [部署指南](../../docs/部署指南.md)

