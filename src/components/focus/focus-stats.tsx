/**
 * ============================================
 * Focus Stats 组件
 * ============================================
 * 
 * 专注统计信息展示
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PageCard } from "@/components/layout/main-layout";
import { ActivityHeatmap } from "@/components/charts/activity-heatmap";
import { formatDuration } from "@/lib/utils";
import { Timer, Flame, TrendingUp, Calendar } from "lucide-react";

interface FocusStatsProps {
  className?: string;
}

// 模拟数据
const mockHeatmapData: Record<string, number> = {};
for (let i = 0; i < 84; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  mockHeatmapData[date.toISOString().split("T")[0]] = Math.floor(Math.random() * 5);
}

export function FocusStats({ className }: FocusStatsProps) {
  const stats = {
    todayMinutes: 125,
    todaySessions: 5,
    weekMinutes: 680,
    weekSessions: 27,
    totalMinutes: 4520,
    totalSessions: 181,
    streak: 12,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <PageCard>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-focus/10">
              <Timer className="h-5 w-5 text-focus" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDuration(stats.todayMinutes)}</p>
              <p className="text-xs text-muted-foreground">今日专注</p>
            </div>
          </div>
        </PageCard>

        <PageCard>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-focus/10">
              <Flame className="h-5 w-5 text-focus" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.streak} 天</p>
              <p className="text-xs text-muted-foreground">连续专注</p>
            </div>
          </div>
        </PageCard>

        <PageCard>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-focus/10">
              <TrendingUp className="h-5 w-5 text-focus" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDuration(stats.weekMinutes)}</p>
              <p className="text-xs text-muted-foreground">本周专注</p>
            </div>
          </div>
        </PageCard>

        <PageCard>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-focus/10">
              <Calendar className="h-5 w-5 text-focus" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">总会话</p>
            </div>
          </div>
        </PageCard>
      </div>

      {/* 热力图 */}
      <PageCard title="专注记录">
        <ActivityHeatmap data={mockHeatmapData} weeks={12} colorScheme="focus" />
      </PageCard>
    </div>
  );
}
