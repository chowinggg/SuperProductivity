/**
 * ============================================
 * Stats Chart 组件
 * ============================================
 * 
 * 使用 recharts 的统计图表
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ============================================
// 周任务完成趋势图
// ============================================

interface WeeklyTrendChartProps {
  data: { day: string; completed: number; created: number }[];
  className?: string;
}

export function WeeklyTrendChart({ data, className }: WeeklyTrendChartProps) {
  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="day" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          />
          <Legend />
          <Bar dataKey="completed" name="已完成" fill="hsl(var(--gtd))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="created" name="新建" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// 专注时长趋势图
// ============================================

interface FocusTrendChartProps {
  data: { date: string; minutes: number }[];
  className?: string;
}

export function FocusTrendChart({ data, className }: FocusTrendChartProps) {
  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--focus))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--focus))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`${value} 分钟`, "专注时长"]}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="hsl(var(--focus))"
            fillOpacity={1}
            fill="url(#colorMinutes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// 任务分布饼图
// ============================================

interface TaskDistributionChartProps {
  data: { name: string; value: number; color: string }[];
  className?: string;
}

export function TaskDistributionChart({ data, className }: TaskDistributionChartProps) {
  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// OKR 进度图
// ============================================

interface OKRProgressChartProps {
  data: { objective: string; progress: number }[];
  className?: string;
}

export function OKRProgressChart({ data, className }: OKRProgressChartProps) {
  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} className="text-xs" />
          <YAxis dataKey="objective" type="category" width={150} className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
            formatter={(value: number) => [`${value}%`, "进度"]}
          />
          <Bar
            dataKey="progress"
            fill="hsl(var(--okr))"
            radius={[0, 4, 4, 0]}
            label={{ position: "right", formatter: (v: number) => `${v}%` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// 习惯打卡日历图（简化版）
// ============================================

interface HabitCalendarChartProps {
  data: { date: string; completed: boolean }[];
  className?: string;
}

export function HabitCalendarChart({ data, className }: HabitCalendarChartProps) {
  // 按周分组
  const weeks = React.useMemo(() => {
    const grouped: { date: string; completed: boolean }[][] = [];
    let currentWeek: { date: string; completed: boolean }[] = [];

    data.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === data.length - 1) {
        grouped.push(currentWeek);
        currentWeek = [];
      }
    });

    return grouped;
  }, [data]);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "w-6 h-6 rounded-sm",
                  day.completed ? "bg-habit" : "bg-muted"
                )}
                title={day.date}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
