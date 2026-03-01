/**
 * ============================================
 * 类型定义统一导出
 * ============================================
 */

import * as React from "react";

// 从 supabase.ts 导出所有类型
export * from './supabase';

// ============================================
// 通用工具类型
// ============================================

/** 可空类型 */
export type Nullable<T> = T | null;

/** 异步函数返回类型 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = 
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

/** API 响应包装类型 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/** API 错误类型 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string | null;
}

/** 分页响应包装 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor: string | null;
}

/** 排序方向 */
export type SortDirection = 'asc' | 'desc';

/** 排序参数 */
export interface SortParams<T extends string = string> {
  field: T;
  direction: SortDirection;
}

/** 加载状态 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** 视图模式 */
export type ViewMode = 'list' | 'grid' | 'board' | 'calendar' | 'timeline';

// ============================================
// UI 相关类型
// ============================================

/** Toast 通知类型 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast 通知 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** 模态框类型 */
export type ModalType = 
  | 'create-objective'
  | 'edit-objective'
  | 'create-key-result'
  | 'edit-key-result'
  | 'create-project'
  | 'edit-project'
  | 'create-task'
  | 'edit-task'
  | 'create-habit'
  | 'edit-habit'
  | 'focus-timer'
  | 'settings'
  | 'confirm';

/** 导航项 */
export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

/** 主题设置 */
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
}

// ============================================
// 业务统计类型
// ============================================

/** 每日概览统计 */
export interface DailyOverview {
  date: string;
  /** 今日待办数量 */
  pendingTasks: number;
  /** 今日已完成任务 */
  completedTasks: number;
  /** 今日习惯完成率 */
  habitCompletionRate: number;
  /** 今日专注时长（分钟） */
  focusMinutes: number;
  /** 进行中的目标数量 */
  activeObjectives: number;
}

/** 周概览统计 */
export interface WeeklyOverview {
  weekStart: string;
  weekEnd: string;
  dailyOverviews: DailyOverview[];
  totalFocusMinutes: number;
  averageHabitCompletion: number;
  completedTasksCount: number;
}

// ============================================
// 组件 Props 类型
// ============================================

/** 通用组件 Props */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/** 表单字段 Props */
export interface FormFieldProps<T = string> {
  name: string;
  label?: string;
  placeholder?: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}
