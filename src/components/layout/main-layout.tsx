/**
 * ============================================
 * Main Layout 主布局组件
 * ============================================
 * 
 * 功能：
 * - 组合侧边栏、顶部栏和主内容区
 * - 提供统一的布局结构
 * - 支持深色模式
 * - 响应式设计
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

/**
 * MainLayout Props
 */
interface MainLayoutProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 内容区域自定义类名 */
  contentClassName?: string;
}

/**
 * 主布局组件
 * 
 * 使用示例：
 * ```tsx
 * export default function Page() {
 *   return (
 *     <MainLayout>
 *       <h1>页面内容</h1>
 *     </MainLayout>
 *   );
 * }
 * ```
 */
export function MainLayout({
  children,
  className,
  contentClassName,
}: MainLayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {/* 侧边栏 - 桌面端显示 */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* 主内容区域 */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 顶部栏 */}
        <Header />

        {/* 内容区域 */}
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6",
            contentClassName
          )}
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * 页面头部组件
 * 
 * 用于统一页面标题区域的样式
 */
interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 右侧操作区域 */
  actions?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 页面内容卡片组件
 * 
 * 用于统一内容区域的卡片样式
 */
interface PageCardProps {
  children: React.ReactNode;
  className?: string;
  /** 卡片标题 */
  title?: string;
  /** 卡片描述 */
  description?: string;
  /** 标题右侧操作 */
  headerActions?: React.ReactNode;
  /** 是否无内边距 */
  noPadding?: boolean;
}

export function PageCard({
  children,
  className,
  title,
  description,
  headerActions,
  noPadding = false,
}: PageCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {(title || description || headerActions) && (
        <div className="flex flex-col space-y-1.5 p-6 border-b">
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>{children}</div>
    </div>
  );
}

/**
 * 加载状态布局
 * 
 * 用于数据加载时的占位显示
 */
export function LoadingLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-64 shrink-0 border-r bg-card animate-pulse" />
      <div className="flex flex-col flex-1">
        <div className="h-16 border-b bg-background animate-pulse" />
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * 错误状态布局
 * 
 * 用于显示错误信息
 */
interface ErrorLayoutProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorLayout({
  title = "出错了",
  message = "加载页面时发生错误，请稍后重试。",
  onRetry,
}: ErrorLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-2xl text-destructive">!</span>
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 text-primary hover:underline"
          >
            重试
          </button>
        )}
      </div>
    </div>
  );
}
