/**
 * ============================================
 * Stats 统计页面（完整版）
 * ============================================
 */

import type { Metadata } from "next";
import { MainLayout, PageHeader, PageCard } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  WeeklyTrendChart, 
  FocusTrendChart, 
  TaskDistributionChart,
  OKRProgressChart 
} from "@/components/charts/stats-chart";
import { ActivityHeatmap } from "@/components/charts/activity-heatmap";
import { 
  Target, 
  ListTodo, 
  CalendarCheck, 
  Timer,
  BarChart3,
  TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "数据统计",
  description: "生产力分析与洞察",
};

// 模拟数据
const weeklyData = [
  { day: "周一", completed: 5, created: 3 },
  { day: "周二", completed: 3, created: 4 },
  { day: "周三", completed: 7, created: 2 },
  { day: "周四", completed: 4, created: 5 },
  { day: "周五", completed: 6, created: 3 },
  { day: "周六", completed: 2, created: 1 },
  { day: "周日", completed: 3, created: 2 },
];

const focusData = [
  { date: "周一", minutes: 120 },
  { date: "周二", minutes: 90 },
  { date: "周三", minutes: 150 },
  { date: "周四", minutes: 75 },
  { date: "周五", minutes: 180 },
  { date: "周六", minutes: 60 },
  { date: "周日", minutes: 45 },
];

const taskDistributionData = [
  { name: "已完成", value: 24, color: "hsl(var(--gtd))" },
  { name: "进行中", value: 12, color: "hsl(var(--okr))" },
  { name: "待处理", value: 8, color: "hsl(var(--muted))" },
];

const okrData = [
  { objective: "提升技术能力", progress: 75 },
  { objective: "保持健康", progress: 60 },
  { objective: "完成MVP", progress: 90 },
];

const heatmapData: Record<string, number> = {};
for (let i = 0; i < 84; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  heatmapData[date.toISOString().split("T")[0]] = Math.floor(Math.random() * 5);
}

export default function StatsPage() {
  return (
    <MainLayout>
      <PageHeader
        title="数据统计"
        description="查看你的生产力数据与趋势分析"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            任务
          </TabsTrigger>
          <TabsTrigger value="habits" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            习惯
          </TabsTrigger>
          <TabsTrigger value="focus" className="gap-2">
            <Timer className="h-4 w-4" />
            专注
          </TabsTrigger>
          <TabsTrigger value="okr" className="gap-2">
            <Target className="h-4 w-4" />
            OKR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 概览统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PageCard>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-okr/10">
                  <Target className="h-6 w-6 text-okr" />
                </div>
                <div>
                  <p className="text-2xl font-bold">75%</p>
                  <p className="text-sm text-muted-foreground">目标完成率</p>
                </div>
              </div>
            </PageCard>

            <PageCard>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gtd/10">
                  <ListTodo className="h-6 w-6 text-gtd" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">本周完成任务</p>
                </div>
              </div>
            </PageCard>

            <PageCard>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-habit/10">
                  <CalendarCheck className="h-6 w-6 text-habit" />
                </div>
                <div>
                  <p className="text-2xl font-bold">82%</p>
                  <p className="text-sm text-muted-foreground">习惯完成率</p>
                </div>
              </div>
            </PageCard>

            <PageCard>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-focus/10">
                  <Timer className="h-6 w-6 text-focus" />
                </div>
                <div>
                  <p className="text-2xl font-bold">18.5h</p>
                  <p className="text-sm text-muted-foreground">本周专注</p>
                </div>
              </div>
            </PageCard>
          </div>

          {/* 活动热力图 */}
          <PageCard title="活动概览">
            <ActivityHeatmap data={heatmapData} weeks={12} colorScheme="green" />
          </PageCard>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <PageCard title="周任务趋势">
              <WeeklyTrendChart data={weeklyData} />
            </PageCard>
            <PageCard title="任务分布">
              <TaskDistributionChart data={taskDistributionData} />
            </PageCard>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <PageCard title="习惯打卡热力图">
            <ActivityHeatmap data={heatmapData} weeks={12} colorScheme="green" />
          </PageCard>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <PageCard title="专注时长趋势">
            <FocusTrendChart data={focusData} />
          </PageCard>
        </TabsContent>

        <TabsContent value="okr" className="space-y-4">
          <PageCard title="目标进度">
            <OKRProgressChart data={okrData} />
          </PageCard>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
