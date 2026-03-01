/**
 * ============================================
 * Error Page 错误页面
 * ============================================
 * 
 * Next.js 错误边界页面
 * 捕获页面级错误
 */

"use client";

import { useEffect } from "react";
import { PageError } from "@/components/data/error-boundary";

/**
 * 错误页面组件
 * 
 * 当页面组件抛出错误时显示此页面
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在这里发送错误日志到监控服务
    console.error("Page error:", error);
  }, [error]);

  return <PageError error={error} reset={reset} />;
}
