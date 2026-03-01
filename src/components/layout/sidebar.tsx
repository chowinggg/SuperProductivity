/**
 * ============================================
 * Sidebar 侧边栏导航组件
 * ============================================
 * 
 * 功能：
 * - 导航到各个模块：OKR、GTD、习惯、专注、统计
 * - 响应式设计：移动端可折叠
 * - 深色模式支持
 * - 当前路由高亮
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/stores/theme";

import {
  Target,
  ListTodo,
  CalendarCheck,
  Timer,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * 导航项配置
 */
const navigationItems = [
  {
    id: "okr",
    title: "OKR 目标",
    href: "/okr",
    icon: Target,
    description: "季度目标与关键结果",
    color: "text-okr",
  },
  {
    id: "gtd",
    title: "GTD 任务",
    href: "/gtd",
    icon: ListTodo,
    description: "任务管理与行动清单",
    color: "text-gtd",
  },
  {
    id: "habits",
    title: "每日习惯",
    href: "/habits",
    icon: CalendarCheck,
    description: "习惯追踪与打卡",
    color: "text-habit",
  },
  {
    id: "focus",
    title: "专注计时",
    href: "/focus",
    icon: Timer,
    description: "番茄钟与专注统计",
    color: "text-focus",
  },
  {
    id: "stats",
    title: "数据统计",
    href: "/stats",
    icon: BarChart3,
    description: "生产力分析与洞察",
    color: "text-primary",
  },
];

/**
 * Sidebar Props
 */
interface SidebarProps {
  className?: string;
}

/**
 * 侧边栏组件
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo 区域 */}
      <div className="flex h-16 items-center border-b px-4">
        <Link
          href="/okr"
          className={cn(
            "flex items-center gap-2 font-bold text-lg transition-all",
            sidebarCollapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shrink-0">
            <Target className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <span className="truncate">Super Productivity</span>
          )}
        </Link>
      </div>

      {/* 导航区域 */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.id}>
                {sidebarCollapsed ? (
                  <SimpleTooltip content={item.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors mx-auto",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", !isActive && item.color)} />
                    </Link>
                  </SimpleTooltip>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", !isActive && item.color)} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{item.title}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* 分隔线 */}
        <Separator className="my-4" />

        {/* 设置项 */}
        <ul className="space-y-1">
          <li>
            {sidebarCollapsed ? (
              <SimpleTooltip content="设置">
                <Link
                  href="/settings"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors mx-auto",
                    pathname === "/settings"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </SimpleTooltip>
            ) : (
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                <span className="font-medium">设置</span>
              </Link>
            )}
          </li>
        </ul>
      </nav>

      {/* 折叠按钮 */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {!sidebarCollapsed && (
            <span className="ml-2">收起侧边栏</span>
          )}
        </Button>
      </div>
    </aside>
  );
}

/**
 * 移动端侧边栏抽屉
 * 用于小屏幕设备
 */
export function MobileSidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 移动端菜单按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <ListTodo className="h-5 w-5" />
        <span className="sr-only">打开菜单</span>
      </Button>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 移动端侧边栏 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link
            href="/okr"
            className="flex items-center gap-2 font-bold text-lg"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <Target className="h-5 w-5" />
            </div>
            <span>Super Productivity</span>
          </Link>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", !isActive && item.color)} />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
