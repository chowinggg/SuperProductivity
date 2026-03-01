/**
 * ============================================
 * Loading Page 加载页面
 * ============================================
 * 
 * Next.js 全局加载状态
 * 在页面数据获取期间显示
 */

import { LoadingLayout } from "@/components/layout/main-layout";

/**
 * 全局加载状态
 * 
 * 当页面正在加载数据时显示
 */
export default function Loading() {
  return <LoadingLayout />;
}
