/**
 * ============================================
 * Supabase Client - 客户端实例
 * ============================================
 * 
 * 用于客户端组件（'use client'）的 Supabase 客户端
 * 使用 createBrowserClient 创建支持自动 token 刷新的客户端
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * 创建浏览器端 Supabase 客户端
 * 
 * 特性：
 * - 自动处理 token 刷新
 * - 使用环境变量中的配置
 * - 类型安全
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * 单例客户端实例
 * 
 * 在客户端组件中可以直接使用此实例
 */
export const supabase = createClient();
