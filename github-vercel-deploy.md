# GitHub + Vercel 完整部署指南

## 📋 准备工作

### 1. 创建 GitHub 账号
- 访问 https://github.com
- 注册账号（如果还没有）

### 2. 创建 GitHub 仓库

**方法一：使用 GitHub 网站**
1. 登录 GitHub
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - Repository name: `super-productivity`（或你喜欢的名字）
   - Description: `集成 OKR + GTD + 习惯追踪的生产力应用`
   - 选择 **Public**（免费）或 **Private**（需要付费账号）
   - ✅ 勾选 "Add a README file"
4. 点击 **Create repository**

**方法二：使用 GitHub CLI**
```bash
# 安装 GitHub CLI
brew install gh

# 登录
gh auth login

# 创建仓库
gh repo create super-productivity --public --description "生产力应用" --source=. --remote=origin --push
```

---

## 📝 第二步：推送代码到 GitHub

### 初始化 Git 并推送

```bash
# 进入项目目录
cd /Users/steven/Desktop/kimicodetest

# 初始化 Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "🎉 Initial commit: Super Productivity App"

# 连接远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/super-productivity.git

# 推送代码
git branch -M main
git push -u origin main
```

### 验证推送成功
- 访问 `https://github.com/你的用户名/super-productivity`
- 应该能看到所有代码文件

---

## 🌐 第三步：在 Vercel 导入项目

### 方法 A：通过 Vercel Dashboard（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 点击 **Sign Up** → 选择 **Continue with GitHub**
   - 授权 Vercel 访问你的 GitHub 账号

2. **导入项目**
   - 登录后点击 **Add New...** → **Project**
   - 在 "Import Git Repository" 列表中找到 `super-productivity`
   - 点击 **Import**

3. **配置项目**
   - **Project Name**: `super-productivity`（或自定义）
   - **Framework Preset**: 选择 **Next.js**
   - **Root Directory**: `./`（保持默认）
   - **Build Command**: `next build`（保持默认）
   - **Output Directory**: `.next`（保持默认）
   - **Install Command**: `npm install`（保持默认）

4. **配置环境变量**
   - 点击 **Environment Variables** 展开
   - 添加以下变量：

   | 名称 | 值 |
   |------|-----|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://dxsuogqzswgisbtmxhje.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4c3VvZ3F6c3dnaXNidG14aGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzY0MjMsImV4cCI6MjA4Nzk1MjQyM30.nltQ5aonjWoYdqM7CQ64kpJDiL1bEqv3sc9rXn6-IQU` |
   | `NEXT_PUBLIC_APP_URL` | `https://super-productivity-你的用户名.vercel.app` |

   - 点击 **Add** 添加每个变量

5. **开始部署**
   - 点击 **Deploy**
   - 等待构建完成（约 2-3 分钟）
   - 成功后点击 **Visit** 查看网站

### 方法 B：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录（会自动打开浏览器授权）
vercel login

# 链接到 GitHub 仓库并部署
vercel --prod

# 按提示操作：
# ? Set up and deploy "~/Desktop/kimicodetest"? [Y/n] Y
# ? Which scope do you want to deploy to? [你的用户名]
# ? Link to existing project? [y/N] n
# ? What's your project name? [super-productivity]
```

---

## ⚙️ 第四步：配置 Supabase（关键！）

部署后，必须配置 Supabase 允许 Vercel 域名访问：

### 1. 配置 Site URL

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 左侧菜单 → **Authentication** → **URL Configuration**
4. 修改以下字段：

   **Site URL**: 
   ```
   https://super-productivity-你的用户名.vercel.app
   ```

   **Redirect URLs**:
   ```
   https://super-productivity-你的用户名.vercel.app
   https://super-productivity-你的用户名.vercel.app/auth/callback
   ```

5. 点击 **Save**

### 2. 可选：配置自定义域名

如果你有自定义域名（如 `myapp.com`）：

1. 在 Vercel Dashboard → 你的项目 → Settings → Domains
2. 添加你的域名
3. 在 Supabase 中也添加对应的 URL

---

## 🔄 第五步：自动部署（后续更新）

### 修改代码后自动部署

```bash
# 1. 修改代码
# 编辑任意文件...

# 2. 提交更改
git add .
git commit -m "✨ 添加新功能：习惯打卡提醒"

# 3. 推送到 GitHub
git push origin main

# 4. Vercel 自动检测并部署
# 约 1-2 分钟后，生产环境自动更新
```

### 查看部署状态

**方式 1：GitHub**
- Push 后在 Commit 旁边会显示 ✅ 或 ❌
- 点击图标查看详细日志

**方式 2：Vercel Dashboard**
- https://vercel.com/dashboard
- 点击你的项目
- 查看 Deployments 列表

**方式 3：邮件通知**
- 部署成功/失败会收到邮件

---

## 🌿 分支部署（预览环境）

### 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 开发新功能
# ...

# 推送分支
git push origin feature/new-feature
```

### 预览部署

Vercel 会自动为每个分支创建预览链接：
- 主分支：`https://super-productivity.vercel.app`
- 功能分支：`https://super-productivity-git-feature-new-feature-你的用户名.vercel.app`

### 合并到主分支

```bash
# 切换回主分支
git checkout main

# 合并功能分支
git merge feature/new-feature

# 推送
git push origin main

# 自动部署到生产环境
```

---

## 🛠️ 常见问题

### Q1: Push 后 Vercel 没有自动部署？

**检查：**
1. Vercel 项目是否正确链接到 GitHub 仓库？
   - Vercel Dashboard → Project → Settings → Git
   - 确认 Connected Git Repository 正确

2. GitHub 是否有权限？
   - GitHub → Settings → Applications → Authorized OAuth Apps
   - 确认 Vercel 有权限

**解决：**
```bash
# 重新链接
vercel --confirm
```

### Q2: 构建失败？

**查看日志：**
1. Vercel Dashboard → Deployments
2. 点击失败的部署
3. 查看 Build Logs

**常见错误：**
- `Module not found` → 检查 node_modules 是否正确安装
- `Type error` → TypeScript 类型错误，本地运行 `npm run build` 检查

### Q3: 环境变量不生效？

**检查：**
1. 变量名是否正确（客户端需要 `NEXT_PUBLIC_` 前缀）
2. 是否在 Production 环境添加
3. 修改后是否重新部署

**解决：**
```bash
# 重新部署触发
vercel --prod
```

### Q4: 登录功能在生产环境不正常？

**检查 Supabase URL Configuration：**
- Site URL 必须是生产域名
- 不能是 localhost

---

## 📱 完整工作流程

### 日常开发流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/xxx

# 3. 开发
# 编辑代码...

# 4. 本地测试
npm run dev
# 访问 http://localhost:3000

# 5. 提交
git add .
git commit -m "feat: 添加 xxx 功能"

# 6. 推送（自动创建预览链接）
git push origin feature/xxx

# 7. 在 GitHub 创建 Pull Request
# 8. 合并后自动部署到生产环境
```

---

## 🎯 最佳实践

### 1. 保护主分支

GitHub → Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals (1)

### 2. 提交信息规范

```bash
# 功能
git commit -m "feat: 添加番茄钟计时器"

# 修复
git commit -m "fix: 修复热力图颜色错误"

# 样式
git commit -m "style: 优化深色模式"

# 文档
git commit -m "docs: 更新 README"

# 重构
git commit -m "refactor: 重构任务列表组件"
```

### 3. 版本标签

```bash
# 发布新版本
git tag -a v1.0.0 -m "🎉 发布 v1.0.0"
git push origin v1.0.0

# Vercel 会自动为这个标签创建部署
```

---

## 🎉 完成！

现在你拥有：
- ✅ GitHub 代码仓库
- ✅ Vercel 自动部署
- ✅ 每次推送自动更新
- ✅ 分支预览环境
- ✅ 生产环境保护

你的应用地址：
```
https://super-productivity-你的用户名.vercel.app
```

下次更新只需：
```bash
git add .
git commit -m "更新内容"
git push
```

自动部署完成！🚀
