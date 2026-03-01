/**
 * ============================================
 * Habit List 组件
 * ============================================
 * 
 * 今日习惯列表
 */

"use client";

import * as React from "react";
import { HabitCard } from "./habit-card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useTodayHabits, useToggleHabitLog } from "@/hooks/use-habits";
import { useToast } from "@/hooks/use-toast";
import type { Habit } from "@/types/supabase";
import { format } from "date-fns";
import { Plus, CalendarCheck } from "lucide-react";

interface HabitListProps {
  onAddClick?: () => void;
  onEditHabit?: (habit: Habit) => void;
}

export function HabitList({ onAddClick, onEditHabit }: HabitListProps) {
  const { data: habits, isLoading, error } = useTodayHabits();
  const toggleMutation = useToggleHabitLog();
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const handleToggle = async (habitId: string, completed: boolean) => {
    try {
      await toggleMutation.mutateAsync({
        habitId,
        date: today,
        completed,
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">加载失败: {error.message}</p>
      </div>
    );
  }

  if (!habits?.length) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">还没有习惯，创建第一个吧！</p>
        <Button className="mt-4" onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          新建习惯
        </Button>
      </div>
    );
  }

  const completedCount = habits.filter((h) => h.todayLog?.is_completed).length;
  const totalCount = habits.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* 进度摘要 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          今日进度: {completedCount}/{totalCount}
        </span>
        <span className="font-medium">{progress}%</span>
      </div>

      {/* 习惯列表 */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={handleToggle}
            onEdit={onEditHabit}
          />
        ))}
      </div>
    </div>
  );
}
