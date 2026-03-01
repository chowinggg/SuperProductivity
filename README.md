<<<<<<< HEAD
# super-productivity
集成 OKR + GTD + 习惯追踪的生产力应用
=======
# Super Productivity App

一个集成 OKR + GTD + 每日打卡 + 专注计时的全栈生产力应用。

**在线演示**: https://your-app.vercel.app (部署后替换)

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + React Query (TanStack Query)
- **表单**: React Hook Form + Zod
- **图表**: Recharts
- **拖拽**: @dnd-kit

## 🌐 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsuper-productivity&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=super-productivity&repository-name=super-productivity)

### 手动部署

1. **准备代码**
```bash
cd /Users/steven/Desktop/kimicodetest
```

2. **安装 Vercel CLI**
```bash
npm i -g vercel
vercel login
```

3. **部署**
```bash
vercel --prod
```

4. **配置环境变量**
在 Vercel Dashboard 中添加：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

详细部署指南查看 [DEPLOY.md](./DEPLOY.md)

## 📁 项目结构

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── okr/               # OKR 目标页面
│   │   ├── gtd/               # GTD 任务页面
│   │   ├── habits/            # 习惯打卡页面
│   │   ├── focus/             # 专注计时页面
│   │   ├── stats/             # 数据统计页面
│   │   ├── login/             # 登录页面
│   │   ├── register/          # 注册页面
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── layout/            # 布局组件
│   │   ├── data/              # 数据层组件
│   │   ├── okr/               # OKR 组件
│   │   ├── gtd/               # GTD 组件
│   │   ├── habits/            # 习惯组件
│   │   ├── focus/             # 专注组件
│   │   └── charts/            # 图表组件
│   │
│   ├── hooks/                 # React Query Hooks
│   ├── lib/                   # 工具函数
│   │   ├── actions/           # Server Actions
│   │   └── supabase/          # Supabase 客户端
│   ├── stores/                # Zustand Stores
│   └── types/                 # TypeScript 类型
│
├── supabase/
│   └── migrations/            # 数据库迁移脚本
│
└── package.json
```

## 🛠️ 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 配置
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行：
```bash
supabase/migrations/init.sql
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## ✨ 核心功能

### OKR 目标管理
- 创建季度目标 (Objectives)
- 设定关键结果 (Key Results) 并追踪进度
- 可视化进度图表

### GTD 任务管理
- 收集箱 (Inbox)
- 今日任务
- 下一步行动
- 等待中/已安排/将来也许
- 任务优先级和截止日期
- 导出到日历 (iCal 格式)

### 每日习惯打卡
- 创建习惯（每日/每周/每月）
- 一键打卡
- 连续打卡天数统计
- 打卡历史热力图

### 专注计时
- 番茄钟 (25分钟)
- 短休息 (5分钟)
- 长休息 (15分钟)
- 自由计时
- 专注统计和趋势

### 数据统计
- 任务完成趋势
- 习惯打卡热力图
- 专注时长统计
- OKR 进度概览

## 📱 使用指南

### 首次使用

1. 访问 `/login` 登录或注册
2. 创建第一个 OKR 目标
3. 添加关键结果 (KR)
4. 在 GTD 中创建任务
5. 设置每日习惯
6. 使用番茄钟专注工作

### 日历同步

1. 在 GTD 页面点击 "导出到日历"
2. 下载 .ics 文件
3. 导入到苹果/谷歌/Outlook 日历

## 🔒 安全

- 所有表启用 RLS (Row Level Security)
- 用户只能访问自己的数据
- Supabase Auth 身份验证
- 中间件保护路由

## 📝 开发指南

### 添加新的 Server Action

```typescript
// src/lib/actions/tasks.ts
"use server";

export async function createTask(input: CreateTaskInput) {
  const supabase = await createClient();
  // ...
}
```

### 添加新的 React Query Hook

```typescript
// src/hooks/use-tasks.ts
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
```

## 📄 License

MIT License
>>>>>>> ec19c798 (Initial commit)
