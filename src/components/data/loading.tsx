/**
 * ============================================
 * Loading Components 加载状态组件
 * ============================================
 * 
 * 各种加载状态的 UI 组件
 */

import { cn } from "@/lib/utils";
import { Skeleton, SkeletonText, SkeletonCard } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

/**
 * 全屏加载
 */
export function FullscreenLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}

/**
 * 页面加载
 */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}

/**
 * 卡片列表加载占位
 */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * 表格加载占位
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
      
      {/* 表行 */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-12 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * 详情页加载占位
 */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* 内容区域 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonText lines={8} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * 仪表盘加载占位
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      
      {/* 主要内容 */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="h-96 lg:col-span-4" />
        <Skeleton className="h-96 lg:col-span-3" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };
