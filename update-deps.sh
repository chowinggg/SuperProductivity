#!/bin/bash
# 更新依赖脚本

echo "更新 Next.js 到安全版本..."
npm install next@latest

echo "更新 ESLint..."
npm install eslint@latest

echo "提交更新..."
git add package.json package-lock.json
git commit -m "chore: 更新依赖到安全版本"
git push origin main

echo "✅ 更新完成，Vercel 会自动重新部署"
