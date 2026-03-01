/**
 * ============================================
 * Tooltip 提示组件 - shadcn/ui 风格
 * ============================================
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/**
 * Tooltip 提供者组件
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip 根组件
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Tooltip 触发器组件
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Tooltip 内容组件
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * 便捷封装的 Tooltip 组件
 * 
 * 示例：
 * ```tsx
 * <SimpleTooltip content="提示文本">
 *   <Button>悬停查看提示</Button>
 * </SimpleTooltip>
 * ```
 */
interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delayDuration?: number;
}

function SimpleTooltip({
  content,
  children,
  delayDuration = 200,
}: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
};
