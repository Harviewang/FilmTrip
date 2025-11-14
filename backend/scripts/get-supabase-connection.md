# 获取Supabase连接字符串的多种方式

## 📋 方式1：在API设置页面

1. 在左侧菜单 **PROJECT SETTINGS** 部分
2. 点击 **API** 或 **Data API**
3. 在API页面中查找：
   - **Database URL** 或 **Connection string**
   - 或 **PostgreSQL connection string**

## 📋 方式2：在Database页面的不同位置

如果您在 **Database → Settings** 页面，请尝试：

1. **查看页面顶部**：是否有标签页（Tabs），切换到 "Connection" 或 "Connection string" 标签
2. **查看页面底部**：滚动到页面底部，可能有连接信息
3. **查看页面右侧**：可能有侧边栏或浮动按钮显示连接信息

## 📋 方式3：使用Project Settings → Database

1. 在左侧菜单 **CONFIGURATION** 部分
2. 点击 **Database**（不是Database下的Settings）
3. 在Database页面中查找连接信息

## 📋 方式4：手动构建连接字符串

如果您知道以下信息，可以手动构建：

### 需要的信息：
1. **项目引用ID**：在Supabase Dashboard的项目设置中查看
2. **数据库密码**：在Database Settings页面可以重置
3. **区域**（region）：通常在项目URL或设置中可以看到
   - 例如：`ap-southeast-1`（新加坡）
   - 或：`us-east-1`（美国东部）

### 连接字符串格式：

**Connection Pooling版本**（推荐）：
```
postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**直接连接版本**：
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**⚠️ 安全提示**：
- 将 `[PROJECT-ID]` 替换为您的Supabase项目ID
- 将 `[PASSWORD]` 替换为您的数据库密码
- 将 `[REGION]` 替换为您的数据库区域
- 连接字符串应存储在环境变量中，不要提交到Git仓库

## 📋 方式5：在Supabase Dashboard首页

1. 点击项目卡片进入项目主页
2. 在项目概览页面中，可能有 "Connection string" 或 "Database URL" 的快捷链接

## 💡 提示

- 连接字符串通常包含密码，只显示一次
- 如果没有看到，可以重置数据库密码后重新生成
- 在Database Settings页面，点击 "Reset database password" 可以重置密码


