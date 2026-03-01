/**
 * ============================================
 * OKR 页面（完整版）
 * ============================================
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { MainLayout, PageHeader, PageCard } from "@/components/layout/main-layout";
import { ObjectiveList } from "@/components/okr/objective-list";
import { OKRProgressChart } from "@/components/charts/stats-chart";
import { DashboardSkeleton } from "@/components/data/loading";
import { getObjectives } from "@/lib/actions/objectives";
import { getCurrentQuarter } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "OKR 目标",
  description: "管理你的季度目标与关键结果",
};

// 统计数据组件
async function OKRStats() {
  try {
    const objectives = await getObjectives(getCurrentQuarter());
    const totalObjectives = objectives.length;
    const avgProgress = totalObjectives > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives)
      : 0;

    // 准备图表数据
    const chartData = objectives.slice(0, 5).map((o) => ({
      objective: o.title.slice(0, 10) + "...",
      progress: o.progress,
    }));

    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <PageCard className="border-l-4 border-l-okr">
          <div className="text-center">
            <p className="text-3xl font-bold">{totalObjectives}</p>
            <p className="text-sm text-muted-foreground">本季度目标</p>
          </div>
        </PageCard>

        <PageCard className="border-l-4 border-l-primary">
          <div className="text-center">
            <p className="text-3xl font-bold">{avgProgress}%</p>
            <p className="text-sm text-muted-foreground">平均进度</p>
          </div>
        </PageCard>

        <PageCard className="border-l-4 border-l-gtd">
          <div className="text-center">
            <p className="text-3xl font-bold">
              {objectives.filter((o) => o.progress === 100).length}
            </p>
            <p className="text-sm text-muted-foreground">已完成</p>
          </div>
        </PageCard>

        {/* 进度图表 */}
        {chartData.length > 0 && (
          <PageCard title="目标进度" className="md:col-span-3">
            <OKRProgressChart data={chartData} />
          </PageCard>
        )}
      </div>
    );
  } catch (error) {
    // 数据库未配置时显示提示
    return (
      <div className="mb-6">
        <PageCard className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                数据库未配置
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                需要配置 Supabase 数据库才能使用完整功能。
              </p>
              <ol className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 list-decimal list-inside space-y-1">
                <li>访问 <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a> 创建项目</li>
                <li>在 SQL Editor 执行 <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">supabase/migrations/00000000000000_init.sql</code></li>
                <li>复制项目 URL 和 Anon Key 到 <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env.local</code></li>
                <li>重启开发服务器</li>
              </ol>
            </div>
          </div>
        </PageCard>
      </div>
    );
  }
}

export default function OKRPage() {
  return (
    <MainLayout>
      <PageHeader
        title="OKR 目标"
        description={`${getCurrentQuarter()} 季度目标管理`}
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <OKRStats />
      </Suspense>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">目标列表</h2>
        <ObjectiveList quarter={getCurrentQuarter()} />
      </div>
    </MainLayout>
  );
}
