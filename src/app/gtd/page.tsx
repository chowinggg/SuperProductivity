/**
 * ============================================
 * GTD 页面（完整版）
 * ============================================
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { MainLayout, PageHeader, PageCard } from "@/components/layout/main-layout";
import { TaskList } from "@/components/gtd/task-list";
import { WeeklyTrendChart } from "@/components/charts/stats-chart";
import { DashboardSkeleton } from "@/components/data/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarSync } from "@/components/gtd/calendar-sync";
import { Inbox, CheckCircle2, Clock, Calendar, Archive } from "lucide-react";

export const metadata: Metadata = {
  title: "GTD 任务",
  description: "任务管理与行动清单",
};

// 模拟周数据
const weeklyData = [
  { day: "周一", completed: 5, created: 3 },
  { day: "周二", completed: 3, created: 4 },
  { day: "周三", completed: 7, created: 2 },
  { day: "周四", completed: 4, created: 5 },
  { day: "周五", completed: 6, created: 3 },
  { day: "周六", completed: 2, created: 1 },
  { day: "周日", completed: 3, created: 2 },
];

export default function GTDPage() {
  return (
    <MainLayout>
      <PageHeader
        title="GTD 任务"
        description="收集、整理、组织、回顾、执行"
        actions={<CalendarSync />}
      />

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">收集箱</span>
          </TabsTrigger>
          <TabsTrigger value="today" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">今日</span>
          </TabsTrigger>
          <TabsTrigger value="next" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">下一步</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">已安排</span>
          </TabsTrigger>
          <TabsTrigger value="someday" className="gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">将来</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <PageCard title="收集箱" description="需要处理的新任务">
            <TaskList filter={{ status: "inbox" }} />
          </PageCard>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <PageCard title="今日任务" description="今天需要完成的任务">
            <TaskList filter={{ status: "next_action" }} />
          </PageCard>
        </TabsContent>

        <TabsContent value="next" className="space-y-4">
          <PageCard title="下一步行动" description="准备好执行的任务">
            <TaskList filter={{ status: "next_action" }} />
          </PageCard>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <PageCard title="已安排" description="已计划执行时间的任务">
            <TaskList filter={{ status: "scheduled" }} />
          </PageCard>
        </TabsContent>

        <TabsContent value="someday" className="space-y-4">
          <PageCard title="将来/可能" description="暂时不需要处理的任务">
            <TaskList filter={{ status: "someday" }} />
          </PageCard>
        </TabsContent>
      </Tabs>

      {/* 统计图表 */}
      <PageCard title="本周任务趋势" className="mt-6">
        <WeeklyTrendChart data={weeklyData} />
      </PageCard>
    </MainLayout>
  );
}
