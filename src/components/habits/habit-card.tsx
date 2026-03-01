/**
 * ============================================
 * Habit Card 组件
 * ============================================
 * 
 * 习惯卡片，显示今日打卡状态
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Habit, HabitLog } from "@/types/supabase";
import { Check, Flame, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitCardProps {
  habit: Habit & { todayLog?: HabitLog | null };
  onToggle?: (habitId: string, completed: boolean) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// 频率标签
const frequencyLabels: Record<string, string> = {
  daily: "每日",
  weekly: "每周",
  monthly: "每月",
  custom: "自定义",
};

export function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  className,
}: HabitCardProps) {
  const isCompleted = habit.todayLog?.is_completed || false;

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card p-4 transition-all",
        isCompleted && "border-habit/50 bg-habit/5",
        className
      )}
    >
      {/* 操作菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(habit)}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete?.(habit.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-start gap-4">
        {/* 打卡按钮 */}
        <Button
          variant={isCompleted ? "default" : "outline"}
          size="icon"
          className={cn(
            "h-12 w-12 shrink-0 rounded-full transition-all",
            isCompleted && "bg-habit hover:bg-habit/90"
          )}
          onClick={() => onToggle?.(habit.id, !isCompleted)}
        >
          <Check
            className={cn(
              "h-6 w-6 transition-all",
              isCompleted ? "scale-100" : "scale-0"
            )}
          />
        </Button>

        {/* 内容 */}
        <div className="flex-1 min-w-0 pr-8">
          <h3
            className={cn(
              "font-semibold truncate",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {habit.name}
          </h3>

          {habit.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {habit.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="habit">{frequencyLabels[habit.frequency]}</Badge>

            {/* 连续打卡 */}
            {(habit as any).current_streak > 0 && (
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-focus" />
                {(habit as any).current_streak} 天
              </Badge>
            )}

            {/* 目标次数 */}
            {habit.target_times > 1 && (
              <Badge variant="outline">
                目标 {habit.target_times} 次
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
