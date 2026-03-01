/**
 * ============================================
 * Supabase Middleware - 中间件处理
 * ============================================
 * 
 * 用于 Next.js Middleware 中刷新用户会话
 * 确保会话在页面导航时保持最新
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * 更新 Supabase 会话的中间件函数
 * 
 * 在 middleware.ts 中使用：
 * ```ts
 * import { updateSession } from '@/lib/supabase/middleware';
 * 
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 * ```
 * 
 * @param request - NextRequest 对象
 * @returns NextResponse
 */
export async function updateSession(request: NextRequest) {
  // 创建响应对象
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 创建 Supabase 客户端
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * 获取 cookie
         */
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        /**
         * 设置 cookie - 同时更新 request 和 response
         */
        set(name: string, value: string, options: CookieOptions) {
          // 更新 request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          });
          
          // 创建新的 response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // 更新 response cookies
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        /**
         * 删除 cookie - 同时更新 request 和 response
         */
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // 刷新会话
  // 这会刷新会话（如果过期）并设置新的 cookie
  await supabase.auth.getUser();

  return response;
}

/**
 * 需要认证的路由检查
 * 
 * 在 middleware.ts 中使用：
 * ```ts
 * export async function middleware(request: NextRequest) {
 *   const { pathname } = request.nextUrl;
 *   
 *   // 检查是否需要认证
 *   if (isProtectedRoute(pathname)) {
 *     const supabase = createServerClient(...);
 *     const { data: { user } } = await supabase.auth.getUser();
 *     
 *     if (!user) {
 *       return NextResponse.redirect(new URL('/login', request.url));
 *     }
 *   }
 *   
 *   return await updateSession(request);
 * }
 * ```
 */
export function isProtectedRoute(pathname: string): boolean {
  // 公开路由
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
  ];

  // 静态资源
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  ) {
    return false;
  }

  // 检查是否在公开路由列表中
  return !publicRoutes.some((route) => pathname.startsWith(route));
}
