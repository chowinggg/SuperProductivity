/**
 * ============================================
 * Skeleton 骨架屏组件 - shadcn/ui 风格
 * ============================================
 */

import { cn } from "@/lib/utils";

/**
 * Skeleton 组件 Props
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示动画 */
  animate?: boolean;
}

/**
 * Skeleton 骨架屏组件
 * 
 * 用于加载状态的占位符
 * 
 * 示例：
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton className="h-20 w-full" />
 * ```
 */
function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton 文本行组件
 * 
 * 用于模拟多行文本加载
 */
function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = "60%",
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 w-full"
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton 卡片组件
 * 
 * 用于模拟卡片加载
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * Skeleton 头像组件
 */
function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar };
