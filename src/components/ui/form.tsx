/**
 * ============================================
 * Form 表单组件
 * ============================================
 * 
 * 基础表单组件封装
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, label, htmlFor, error, required, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label htmlFor={htmlFor}>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
FormItem.displayName = "FormItem";

export { FormItem };
