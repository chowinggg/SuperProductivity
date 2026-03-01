/**
 * ============================================
 * React Query Provider 组件
 * ============================================
 * 
 * 为应用提供 React Query 上下文
 * 配置客户端缓存和开发工具
 */

"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/lib/query-client";

/**
 * QueryProvider Props
 */
interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider 组件
 * 
 * 包装应用以提供 React Query 功能
 * 仅在客户端创建 QueryClient 实例
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // 使用 ref 确保在组件生命周期内只创建一次 QueryClient
  const [queryClient] = React.useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 开发环境显示 React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
