/**
 * ============================================
 * Habits 页面（完整版）
 * ============================================
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { MainLayout, PageHeader, PageCard } from "@/components/layout/main-layout";
import { HabitList } from "@/components/habits/habit-list";
import { ActivityHeatmap } from "@/components/charts/activity-heatmap";
import { DashboardSkeleton } from "@/components/data/loading";
import { getTodayHabits } from "@/lib/actions/habits";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarCheck, Flame, TrendingUp, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "每日习惯",
  description: "习惯追踪与每日打卡",
};

// 模拟热力图数据
const mockHeatmapData: Record<string, number> = {};
for (let i = 0; i < 84; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  mockHeatmapData[format(date, "yyyy-MM-dd")] = Math.floor(Math.random() * 5);
}

// 统计数据组件
async function HabitsStats() {
  const habits = await getTodayHabits();
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.todayLog?.is_completed).length;
  const progress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <PageCard className="border-l-4 border-l-habit">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-habit/10">
            <CalendarCheck className="h-6 w-6 text-habit" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">今日习惯</p>
            <p className="text-2xl font-bold">{totalHabits}</p>
          </div>
        </div>
      </PageCard>

      <PageCard className="border-l-4 border-l-focus">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-focus/10">
            <Flame className="h-6 w-6 text-focus" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">已完成</p>
            <p className="text-2xl font-bold">{completedHabits}</p>
          </div>
        </div>
      </PageCard>

      <PageCard className="border-l-4 border-l-gtd">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gtd/10">
            <TrendingUp className="h-6 w-6 text-gtd" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">完成率</p>
            <p className="text-2xl font-bold">{progress}%</p>
          </div>
        </div>
      </PageCard>

      <PageCard className="border-l-4 border-l-okr">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-okr/10">
            <Target className="h-6 w-6 text-okr" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">连续打卡</p>
            <p className="text-2xl font-bold">12 天</p>
          </div>
        </div>
      </PageCard>
    </div>
  );
}

export default function HabitsPage() {
  const today = new Date();

  return (
    <MainLayout>
      <PageHeader
        title="每日习惯"
        description="养成好习惯，每日打卡追踪进度"
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <HabitsStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 今日打卡 */}
        <PageCard 
          title="今日打卡" 
          className="lg:col-span-2"
          description={format(today, "yyyy年MM月dd日 EEEE", { locale: zhCN })}
        >
          <Suspense fallback={<DashboardSkeleton />}>
            <HabitList />
          </Suspense>
        </PageCard>

        {/* 历史记录热力图 */}
        <PageCard title="打卡历史">
          <ActivityHeatmap 
            data={mockHeatmapData} 
            weeks={12} 
            colorScheme="green" 
          />
        </PageCard>
      </div>
    </MainLayout>
  );
}
