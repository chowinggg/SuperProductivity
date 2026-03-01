/**
 * ============================================
 * Supabase Server Client - 服务端实例
 * ============================================
 * 
 * 用于 Server Components、Server Actions 和 API Routes
 * 使用 createServerClient 创建支持 cookie 管理的客户端
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * 创建服务端 Supabase 客户端
 * 
 * 用于：
 * - Server Components
 * - Server Actions
 * - Route Handlers (API Routes)
 * 
 * 特性：
 * - 自动处理 cookie
 * - 支持服务端身份验证
 * - 类型安全
 */
export async function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * 获取指定名称的 cookie
         */
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        /**
         * 设置 cookie
         */
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 如果设置为"use server"的 Server Component 调用 set 会报错
            // 这是预期的行为
          }
        },
        /**
         * 删除 cookie
         */
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // 如果设置为"use server"的 Server Component 调用 remove 会报错
            // 这是预期的行为
          }
        },
      },
    }
  );
}

/**
 * 获取当前用户（服务端）
 * 
 * 在 Server Component 中使用
 * 
 * 示例：
 * ```tsx
 * export default async function Page() {
 *   const user = await getCurrentUser();
 *   if (!user) redirect('/login');
 *   // ...
 * }
 * ```
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 获取当前会话（服务端）
 * 
 * 在 Server Component 中使用
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 需要认证的 Server Action 包装器
 * 
 * 示例：
 * ```tsx
 * export const createObjective = withAuth(async (user, data) => {
 *   const supabase = await createClient();
 *   // ... 使用 user.id 进行数据操作
 * });
 * ```
 */
export function withAuth<TArgs extends unknown[], TReturn>(
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, ...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    return handler(user, ...args);
  };
}
