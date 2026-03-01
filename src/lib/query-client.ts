/**
 * ============================================
 * React Query Client 配置
 * ============================================
 * 
 * 配置全局的 React Query 客户端
 * 包含默认的缓存策略和错误处理
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * 创建 Query Client 实例
 * 
 * 在客户端组件和 Provider 中使用
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 缓存时间：5分钟
        staleTime: 1000 * 60 * 5,
        // 数据保持时间：10分钟
        gcTime: 1000 * 60 * 10,
        // 错误重试次数
        retry: 2,
        // 重试延迟（指数退避）
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 窗口重新聚焦时刷新数据
        refetchOnWindowFocus: false,
        // 网络重连时刷新数据
        refetchOnReconnect: true,
        // 组件挂载时如果数据是 stale 则刷新
        refetchOnMount: true,
      },
      mutations: {
        // 错误重试次数
        retry: 1,
        // 重试延迟
        retryDelay: 1000,
      },
    },
  });
}

/**
 * 服务端渲染用的 Query Client
 * 
 * 用于初始数据获取
 */
export const queryClient = makeQueryClient();

/**
 * 查询键工厂
 * 
 * 用于生成一致的查询键，避免硬编码字符串
 * 
 * 使用示例：
 * ```tsx
 * // 获取所有目标
 * useQuery({ queryKey: queryKeys.objectives.all })
 * 
 * // 获取单个目标
 * useQuery({ queryKey: queryKeys.objectives.detail(id) })
 * 
 * // 获取目标的子数据
 * useQuery({ queryKey: queryKeys.objectives.keyResults(id) })
 * ```
 */
export const queryKeys = {
  // Objectives
  objectives: {
    all: ["objectives"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.objectives.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.objectives.all, id] as const,
    keyResults: (id: string) =>
      [...queryKeys.objectives.detail(id), "keyResults"] as const,
  },
  
  // Key Results
  keyResults: {
    all: ["keyResults"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.keyResults.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.keyResults.all, id] as const,
  },
  
  // Projects
  projects: {
    all: ["projects"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.projects.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
    tasks: (id: string) =>
      [...queryKeys.projects.detail(id), "tasks"] as const,
  },
  
  // Tasks
  tasks: {
    all: ["tasks"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.tasks.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.tasks.all, id] as const,
    subtasks: (id: string) =>
      [...queryKeys.tasks.detail(id), "subtasks"] as const,
    inbox: () => [...queryKeys.tasks.all, "inbox"] as const,
    today: () => [...queryKeys.tasks.all, "today"] as const,
    upcoming: () => [...queryKeys.tasks.all, "upcoming"] as const,
  },
  
  // Habits
  habits: {
    all: ["habits"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.habits.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.habits.all, id] as const,
    logs: (id: string, date?: string) =>
      [...queryKeys.habits.detail(id), "logs", date] as const,
    today: () => [...queryKeys.habits.all, "today"] as const,
  },
  
  // Habit Logs
  habitLogs: {
    all: ["habitLogs"] as const,
    byDate: (date: string) => [...queryKeys.habitLogs.all, date] as const,
    byHabit: (habitId: string) =>
      [...queryKeys.habitLogs.all, "habit", habitId] as const,
  },
  
  // Focus Sessions
  focusSessions: {
    all: ["focusSessions"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.focusSessions.all, "list", filters] as const,
    today: () => [...queryKeys.focusSessions.all, "today"] as const,
    stats: () => [...queryKeys.focusSessions.all, "stats"] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    overview: () => [...queryKeys.dashboard.all, "overview"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
  },
};
