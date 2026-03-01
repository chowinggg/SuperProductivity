# 🚀 部署到 Vercel 指南

## 方法一：使用 Vercel CLI（推荐）

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```
按提示完成登录。

### 3. 部署项目

```bash
cd /Users/steven/Desktop/kimicodetest
vercel
```

按提示操作：
- Set up and deploy? **Y**
- Which scope? 选择你的用户名
- Link to existing project? **N**（首次部署）
- What's your project name? **super-productivity**（或你喜欢的名字）

### 4. 配置环境变量

部署完成后，在 Vercel Dashboard 中配置环境变量：

1. 访问 https://vercel.com/dashboard
2. 找到你的项目，点击进入
3. 点击 **Settings** → **Environment Variables**
4. 添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://dxsuogqzswgisbtmxhje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4c3VvZ3F6c3dnaXNidG14aGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzY0MjMsImV4cCI6MjA4Nzk1MjQyM30.nltQ5aonjWoYdqM7CQ64kpJDiL1bEqv3sc9rXn6-IQU
NEXT_PUBLIC_APP_URL=https://你的项目名称.vercel.app
```

5. 点击 **Save**

### 5. 重新部署

```bash
vercel --prod
```

---

## 方法二：使用 Git 推送（自动部署）

### 1. 创建 GitHub 仓库

```bash
cd /Users/steven/Desktop/kimicodetest

# 初始化 git
git init

# 添加文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
# 在 GitHub 上创建新仓库，然后：
git remote add origin https://github.com/你的用户名/super-productivity.git
git branch -M main
git push -u origin main
```

### 2. 在 Vercel 中导入项目

1. 访问 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择你的 GitHub 仓库 **super-productivity**
4. 点击 **Import**

### 3. 配置项目

- **Framework Preset**: Next.js
- **Root Directory**: ./
- **Build Command**: next build
- **Output Directory**: .next

点击 **Environment Variables**，添加：

```
NEXT_PUBLIC_SUPABASE_URL=https://dxsuogqzswgisbtmxhje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4c3VvZ3F6c3dnaXNidG14aGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzY0MjMsImV4cCI6MjA4Nzk1MjQyM30.nltQ5aonjWoYdqM7CQ64kpJDiL1bEqv3sc9rXn6-IQU
```

点击 **Deploy**

---

## 配置 Supabase 允许 Vercel 访问

部署后，需要在 Supabase 中添加 Vercel 域名到允许列表：

1. 打开 Supabase Dashboard
2. 点击 **Authentication** → **URL Configuration**
3. 在 **Site URL** 中添加你的 Vercel 域名：
   ```
   https://你的项目名称.vercel.app
   ```
4. 在 **Redirect URLs** 中添加：
   ```
   https://你的项目名称.vercel.app/auth/callback
   ```

---

## 更新本地代码后重新部署

### 使用 CLI：
```bash
cd /Users/steven/Desktop/kimicodetest
vercel --prod
```

### 使用 Git：
```bash
git add .
git commit -m "Update features"
git push origin main
```
Git 推送后会自动触发 Vercel 重新部署。

---

## 常见问题

### 1. Build 失败
检查 `package.json` 中的 scripts：
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### 2. 环境变量不生效
- 确保变量名以 `NEXT_PUBLIC_` 开头（客户端可用）
- 重新部署后才能生效

### 3. 图片不显示
检查 `next.config.js` 中的 `images.remotePatterns` 配置

### 4. 登录后跳转失败
检查 Supabase 中的 URL Configuration 是否正确配置了 Vercel 域名

---

## 自定义域名（可选）

1. 在 Vercel Dashboard → 你的项目 → Settings → Domains
2. 添加你的域名
3. 按提示配置 DNS
