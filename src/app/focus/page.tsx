/**
 * ============================================
 * Focus 页面（完整版）
 * ============================================
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { MainLayout, PageHeader, PageCard } from "@/components/layout/main-layout";
import { FocusTimer } from "@/components/focus/focus-timer";
import { FocusStats } from "@/components/focus/focus-stats";
import { FocusTrendChart } from "@/components/charts/stats-chart";
import { DashboardSkeleton } from "@/components/data/loading";

export const metadata: Metadata = {
  title: "专注计时",
  description: "番茄钟与专注统计",
};

// 模拟专注趋势数据
const focusTrendData = [
  { date: "周一", minutes: 120 },
  { date: "周二", minutes: 90 },
  { date: "周三", minutes: 150 },
  { date: "周四", minutes: 75 },
  { date: "周五", minutes: 180 },
  { date: "周六", minutes: 60 },
  { date: "周日", minutes: 45 },
];

export default function FocusPage() {
  return (
    <MainLayout>
      <PageHeader
        title="专注计时"
        description="番茄钟工作法，提升专注力"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 计时器 */}
        <PageCard 
          title="番茄钟" 
          className="lg:col-span-2"
          description="选择一个任务，开始专注"
        >
          <div className="py-8">
            <FocusTimer />
          </div>
        </PageCard>

        {/* 快速统计 */}
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="space-y-6">
            <FocusStats />
          </div>
        </Suspense>
      </div>

      {/* 专注趋势 */}
      <PageCard title="本周专注趋势" className="mt-6">
        <FocusTrendChart data={focusTrendData} />
      </PageCard>
    </MainLayout>
  );
}
