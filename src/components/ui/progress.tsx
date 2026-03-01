/**
 * ============================================
 * Progress 进度条组件 - shadcn/ui 风格
 * ============================================
 */

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * 进度条变体样式
 */
const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
      variant: {
        default: "",
        success: "",
        warning: "",
        danger: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

/**
 * 指示器变体样式
 */
const indicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      danger: "bg-red-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Progress 组件 Props
 */
interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  /** 当前值 */
  value?: number;
  /** 最大值 */
  max?: number;
  /** 是否显示百分比文本 */
  showValue?: boolean;
  /** 自定义指示器类名 */
  indicatorClassName?: string;
}

/**
 * Progress 进度条组件
 * 
 * 示例：
 * ```tsx
 * <Progress value={60} />
 * <Progress value={80} max={100} showValue />
 * <Progress value={45} variant="success" />
 * ```
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      variant,
      showValue = false,
      indicatorClassName,
      ...props
    },
    ref
  ) => {
    // 计算百分比
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="flex items-center gap-2">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(progressVariants({ size, variant }), className)}
          value={value}
          max={max}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(indicatorVariants({ variant }), indicatorClassName)}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </ProgressPrimitive.Root>
        
        {showValue && (
          <span className="text-xs text-muted-foreground w-10 text-right">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * CircularProgress 圆形进度条组件
 */
interface CircularProgressProps {
  /** 当前值 */
  value: number;
  /** 最大值 */
  max?: number;
  /** 尺寸 */
  size?: number;
  /** 线宽 */
  strokeWidth?: number;
  /** 变体 */
  variant?: "default" | "success" | "warning" | "danger";
  /** 是否显示值 */
  showValue?: boolean;
  /** 自定义类名 */
  className?: string;
}

function CircularProgress({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  variant = "default",
  showValue = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    default: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-300", colorClasses[variant])}
        />
      </svg>
      
      {showValue && (
        <span className="absolute text-xs font-medium">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export { Progress, CircularProgress };
