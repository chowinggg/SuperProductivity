# 部署访问指南

## 🌐 访问地址

### 主要地址（需要 VPN）
https://superproductivity-parg8sgdp-chowingggs-projects.vercel.app/

### 国内访问方案

#### 方案 A：自定义域名（推荐）
1. 在 Vercel 项目设置中添加自己的域名
2. 在国内 DNS 服务商配置解析
3. 无需 VPN 即可访问

#### 方案 B：Vercel 预览链接
每次提交后，Vercel 会生成预览链接，格式如：
`https://super-productivity-app-git-main-chowinggg.vercel.app`

#### 方案 C：Cloudflare Pages 镜像（备用）
可以将项目同时部署到 Cloudflare Pages：
https://pages.cloudflare.com/

## 🔧 技术栈

- Next.js 14
- Supabase
- Tailwind CSS
- shadcn/ui
