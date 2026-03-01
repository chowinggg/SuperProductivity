/**
 * ============================================
 * Next.js Middleware
 * ============================================
 * 
 * 全局中间件配置
 * - 刷新 Supabase 会话
 * - 保护需要认证的路由
 */

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// 公开路由（不需要登录）
const publicRoutes = ["/login", "/register", "/auth/callback"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 刷新会话
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // 如果是根路径，重定向到登录或 OKR
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/okr", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 如果用户未登录且访问非公开路由，重定向到登录页
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 如果用户已登录且访问登录/注册页，重定向到 OKR
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL("/okr", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
