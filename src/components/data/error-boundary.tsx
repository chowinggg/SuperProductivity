/**
 * ============================================
 * Error Boundary 错误边界组件
 * ============================================
 * 
 * 捕获 React 组件树中的错误
 * 防止整个应用崩溃
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary Props
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** 自定义回退 UI */
  fallback?: React.ReactNode;
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * ErrorBoundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 * 
 * 使用示例：
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      // 如果有自定义回退 UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <h2 className="mb-2 text-xl font-semibold text-destructive">
            出错了
          </h2>
          
          <p className="mb-6 max-w-md text-muted-foreground">
            组件加载时发生错误。这可能是临时问题，请尝试刷新页面。
          </p>
          
          {this.state.error && process.env.NODE_ENV === "development" && (
            <pre className="mb-6 max-w-lg overflow-auto rounded-md bg-destructive/10 p-4 text-left text-sm text-destructive">
              {this.state.error.message}
              {"\n"}
              {this.state.error.stack}
            </pre>
          )}
          
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 页面级错误边界组件
 * 
 * 用于 Next.js error.tsx
 */
export function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      
      <h2 className="mb-2 text-2xl font-bold">页面加载失败</h2>
      
      <p className="mb-6 max-w-md text-muted-foreground">
        抱歉，加载页面时出现问题。请尝试刷新页面或返回首页。
      </p>
      
      {process.env.NODE_ENV === "development" && (
        <div className="mb-6 max-w-2xl overflow-auto rounded-md bg-muted p-4 text-left">
          <p className="mb-2 font-mono text-sm font-semibold text-destructive">
            {error.message}
          </p>
          {error.stack && (
            <pre className="text-xs text-muted-foreground">
              {error.stack}
            </pre>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          重试
        </Button>
        <Button onClick={() => window.location.href = "/"}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
