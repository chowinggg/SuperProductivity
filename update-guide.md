# 📝 部署后修改指南

## 方法一：Git 自动部署（推荐）

每次推送代码到 GitHub，Vercel 会自动重新部署：

```bash
# 1. 修改代码
# ... 编辑文件 ...

# 2. 提交更改
git add .
git commit -m "修复 bug / 添加新功能"

# 3. 推送到 GitHub
git push origin main

# 4. Vercel 自动检测并重新部署
# 约 1-2 分钟后自动生效
```

## 方法二：Vercel CLI 重新部署

```bash
# 进入项目目录
cd /Users/steven/Desktop/kimicodetest

# 重新部署
vercel --prod

# 或只部署预览版本
vercel
```

## 方法三：修改环境变量

### 场景 1：在 Vercel Dashboard 中修改

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **Settings** → **Environment Variables**
4. 编辑或添加变量
5. 点击 **Save**
6. 重新部署：
   - Git 方式：任意推送触发
   - CLI 方式：运行 `vercel --prod`

### 场景 2：使用 CLI 修改

```bash
# 添加环境变量
vercel env add NEXT_PUBLIC_API_KEY

# 查看环境变量
vercel env ls

# 删除环境变量
vercel env rm NEXT_PUBLIC_API_KEY

# 然后重新部署
vercel --prod
```

## 数据库修改

### 添加新表/修改表结构

```bash
# 1. 在本地修改 SQL 迁移脚本
# supabase/migrations/xxxx_new_feature.sql

# 2. 在 Supabase Dashboard SQL Editor 中执行

# 3. 提交代码
git add .
git commit -m "添加新表 xxx"
git push

# 4. 自动部署完成
```

### 使用 Supabase CLI（可选）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 推送数据库更改
supabase db push
```

## 常见修改场景

### 场景 1：修改页面文字

```bash
# 编辑 src/app/okr/page.tsx
# 修改标题等文字

git add .
git commit -m "更新页面标题"
git push
# ✅ 自动部署完成
```

### 场景 2：添加新页面

```bash
# 创建新文件
mkdir -p src/app/reports
touch src/app/reports/page.tsx

# 编写页面代码
# ...

git add .
git commit -m "添加报表页面"
git push
# ✅ 自动部署完成
```

### 场景 3：修改样式

```bash
# 编辑 tailwind.config.ts 或组件样式
# ...

git add .
git commit -m "优化深色模式样式"
git push
# ✅ 自动部署完成
```

### 场景 4：添加新依赖

```bash
# 安装新包
npm install some-package

# 提交 package.json 和 package-lock.json
git add package.json package-lock.json
git commit -m "添加 some-package 依赖"
git push
# ✅ 自动部署时会自动安装依赖
```

## 🚀 快速修改流程

```bash
# 1. 确保在正确的目录
cd /Users/steven/Desktop/kimicodetest

# 2. 确保 git 已初始化
# git status

# 3. 修改代码
# 使用 VS Code 或任意编辑器

# 4. 提交并推送
git add .
git commit -m "你的修改说明"
git push origin main

# 5. 等待 1-2 分钟
# Vercel 会自动构建并部署

# 6. 查看部署状态
# 访问 https://vercel.com/dashboard
```

## ⚠️ 注意事项

1. **环境变量修改后必须重新部署**
   - 修改环境变量不会自动触发重新部署
   - 需要手动推送一次代码或运行 `vercel --prod`

2. **数据库迁移需要手动执行**
   - Vercel 不会自动执行 SQL 迁移
   - 需要在 Supabase Dashboard 中手动执行 SQL

3. **域名缓存**
   - 修改后可能需要清除浏览器缓存或强制刷新
   - 按 `Cmd+Shift+R` (Mac) 或 `Ctrl+F5` (Windows)

4. **构建失败**
   - 如果推送后构建失败，Vercel 会发送邮件通知
   - 查看 Dashboard 中的 Logs 了解错误详情

## 🎯 最佳实践

1. **本地测试后再推送**
   ```bash
   npm run build
   npm start
   # 确认本地构建成功后再推送
   ```

2. **使用分支开发**
   ```bash
   git checkout -b feature/new-feature
   # 开发...
   git push origin feature/new-feature
   # 创建 Pull Request
   # 合并后自动部署到生产环境
   ```

3. **提交信息规范**
   ```bash
   git commit -m "feat: 添加习惯打卡功能"
   git commit -m "fix: 修复热力图颜色错误"
   git commit -m "style: 优化按钮样式"
   ```

## 📱 监控部署状态

### 方式 1：Vercel Dashboard
- https://vercel.com/dashboard
- 查看实时构建日志

### 方式 2：GitHub
- Push 后会在 PR/Commit 旁边显示部署状态
- ✅ 表示部署成功
- ❌ 表示部署失败

### 方式 3：Vercel CLI
```bash
vercel logs
# 查看实时日志

vercel list
# 查看所有部署版本
```
