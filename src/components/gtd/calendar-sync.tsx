/**
 * ============================================
 * Calendar Sync 组件
 * ============================================
 * 
 * 同步任务到系统日历
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadICal, generateCalendarLinks } from "@/lib/calendar";
import type { Task } from "@/types/supabase";
import { Calendar, ChevronDown, Apple, ExternalLink } from "lucide-react";

interface CalendarSyncProps {
  task?: Task;
  tasks?: Task[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function CalendarSync({
  task,
  tasks,
  variant = "outline",
  size = "default",
}: CalendarSyncProps) {
  const handleExportICal = () => {
    const tasksToExport = task ? [task] : tasks || [];
    if (tasksToExport.length === 0) {
      alert("没有可导出的任务");
      return;
    }
    downloadICal(tasksToExport, task ? "task.ics" : "my-tasks.ics");
  };

  const handleOpenGoogle = () => {
    if (!task) return;
    const links = generateCalendarLinks(task);
    if (links?.google) {
      window.open(links.google, "_blank");
    }
  };

  const handleOpenOutlook = () => {
    if (!task) return;
    const links = generateCalendarLinks(task);
    if (links?.outlook) {
      window.open(links.outlook, "_blank");
    }
  };

  // 如果是单个任务，提供快捷添加
  if (task) {
    const links = generateCalendarLinks(task);
    if (!links) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">添加到日历</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportICal}>
            <Apple className="mr-2 h-4 w-4" />
            下载 .ics（苹果/Outlook）
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenGoogle}>
            <ExternalLink className="mr-2 h-4 w-4" />
            打开 Google 日历
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenOutlook}>
            <ExternalLink className="mr-2 h-4 w-4" />
            打开 Outlook
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 批量导出
  return (
    <Button variant={variant} size={size} onClick={handleExportICal} className="gap-2">
      <Calendar className="h-4 w-4" />
      导出到日历
    </Button>
  );
}

/**
 * 苹果日历设置指南
 */
export function AppleCalendarGuide() {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 text-sm">
      <h4 className="font-semibold mb-2">📱 如何同步到苹果日历</h4>
      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
        <li>点击"导出到日历"下载 .ics 文件</li>
        <li>在 Mac/iPhone 上打开下载的文件</li>
        <li>系统会自动打开"日历"App 并询问是否添加</li>
        <li>选择要添加到的日历，点击"确定"</li>
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">
        💡 提示：你也可以在 iPhone 设置中开启 Google 日历同步，然后使用 Google 日历选项
      </p>
    </div>
  );
}
