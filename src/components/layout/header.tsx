/**
 * ============================================
 * Header 顶部栏组件
 * ============================================
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { MobileSidebar } from "./sidebar";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Target,
  ListTodo,
  CalendarCheck,
  Timer,
} from "lucide-react";

const breadcrumbMap: Record<string, { title: string; icon?: React.ElementType }> = {
  okr: { title: "OKR 目标", icon: Target },
  gtd: { title: "GTD 任务", icon: ListTodo },
  habits: { title: "每日习惯", icon: CalendarCheck },
  focus: { title: "专注计时", icon: Timer },
  stats: { title: "数据统计", icon: Timer },
  settings: { title: "设置", icon: Settings },
  login: { title: "登录", icon: User },
  register: { title: "注册", icon: User },
};

const quickAddItems = [
  { id: "objective", label: "目标 (O)", icon: Target, href: "/okr?create=true" },
  { id: "task", label: "任务", icon: ListTodo, href: "/gtd?create=true" },
  { id: "habit", label: "习惯", icon: CalendarCheck, href: "/habits?create=true" },
];

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    
    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const config = breadcrumbMap[segment] || { title: segment };
      return { ...config, href, segment };
    });
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <MobileSidebar />

      <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground flex-1">
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
          首页
        </Link>
        {breadcrumbs.map((crumb, index) => {
          const Icon = crumb.icon;
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={crumb.href}
                className={cn(
                  "flex items-center gap-1 transition-colors",
                  isLast ? "font-medium text-foreground" : "hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{crumb.title}</span>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <SimpleTooltip content="搜索 (Cmd+K)">
          <Button variant="outline" size="icon" className="hidden sm:flex">
            <Search className="h-4 w-4" />
            <span className="sr-only">搜索</span>
          </Button>
        </SimpleTooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="hidden sm:flex gap-1">
              <Plus className="h-4 w-4" />
              <span>快速添加</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>快速添加</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickAddItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.id} asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <SimpleTooltip content="通知">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="sr-only">通知</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              3
            </span>
          </Button>
        </SimpleTooltip>

        {mounted && (
          <SimpleTooltip content={theme === "dark" ? "切换到浅色" : "切换到深色"}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">切换主题</span>
            </Button>
          </SimpleTooltip>
        )}

        {/* 登录/用户菜单 */}
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{user.user_metadata?.name || "用户"}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>个人资料</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>设置</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm" asChild>
            <Link href="/login">登录</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
