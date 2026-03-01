/**
 * ============================================
 * Button 组件 - shadcn/ui 风格
 * ============================================
 * 
 * 支持变体：default, destructive, outline, secondary, ghost, link
 * 支持尺寸：default, sm, lg, icon
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Button 变体样式定义
 */
const buttonVariants = cva(
  // 基础样式
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // 主按钮
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // 破坏按钮（删除等危险操作）
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // 轮廓按钮
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        // 次要按钮
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        // 幽灵按钮
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // 链接按钮
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button 组件 Props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 是否使用 asChild 模式 */
  asChild?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 加载时显示的文本 */
  loadingText?: string;
}

/**
 * Button 组件
 * 
 * 示例：
 * ```tsx
 * <Button>默认按钮</Button>
 * <Button variant="destructive">删除</Button>
 * <Button size="icon"><Icon /></Button>
 * <Button loading>加载中</Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
