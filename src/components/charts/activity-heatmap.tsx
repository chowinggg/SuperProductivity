/**
 * ============================================
 * Activity Heatmap 组件
 * ============================================
 * 
 * 活动热力图，用于展示习惯打卡或专注时间的可视化
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, subDays, startOfWeek, addDays, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ActivityHeatmapProps {
  /** 数据：日期 -> 值（0-4） */
  data: Record<string, number>;
  /** 显示的周数 */
  weeks?: number;
  /** 颜色主题 */
  colorScheme?: "green" | "blue" | "purple" | "orange" | "focus" | "gtd" | "okr" | "habit";
  className?: string;
}

// 颜色配置
const colorSchemes = {
  green: ["bg-gray-100", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500"],
  blue: ["bg-gray-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500"],
  purple: ["bg-gray-100", "bg-purple-200", "bg-purple-300", "bg-purple-400", "bg-purple-500"],
  orange: ["bg-gray-100", "bg-orange-200", "bg-orange-300", "bg-orange-400", "bg-orange-500"],
  focus: ["bg-gray-100", "bg-red-200", "bg-red-300", "bg-red-400", "bg-red-500"],
  gtd: ["bg-gray-100", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500"],
  okr: ["bg-gray-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500"],
  habit: ["bg-gray-100", "bg-violet-200", "bg-violet-300", "bg-violet-400", "bg-violet-500"],
};

// 星期标签
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

export function ActivityHeatmap({
  data,
  weeks = 12,
  colorScheme = "green",
  className,
}: ActivityHeatmapProps) {
  const colors = colorSchemes[colorScheme];

  // 生成日期网格
  const generateGrid = () => {
    const grid: { date: Date; value: number; dateStr: string }[][] = [];
    const endDate = new Date();
    const startDate = subDays(endDate, weeks * 7 - 1);

    // 调整到周一开始
    const startOfGrid = startOfWeek(startDate, { locale: zhCN });

    for (let week = 0; week < weeks; week++) {
      const weekData: { date: Date; value: number; dateStr: string }[] = [];
      for (let day = 0; day < 7; day++) {
        const date = addDays(startOfGrid, week * 7 + day);
        const dateStr = format(date, "yyyy-MM-dd");
        weekData.push({
          date,
          value: data[dateStr] || 0,
          dateStr,
        });
      }
      grid.push(weekData);
    }

    return grid;
  };

  const grid = generateGrid();

  // 获取颜色级别
  const getColorLevel = (value: number): string => {
    if (!colors || colors.length === 0) return "bg-gray-100";
    if (value === 0) return colors[0];
    if (value <= 1) return colors[1] || colors[0];
    if (value <= 2) return colors[2] || colors[0];
    if (value <= 3) return colors[3] || colors[0];
    return colors[4] || colors[0];
  };

  return (
    <TooltipProvider>
      <div className={cn("overflow-x-auto", className)}>
        <div className="inline-block">
          {/* 星期标签 */}
          <div className="flex">
            <div className="w-8" />
            <div className="flex gap-1">
              {grid.map((_, weekIndex) => (
                <div key={weekIndex} className="w-3 text-center text-xs text-muted-foreground">
                  {weekIndex % 4 === 0 && format(grid[weekIndex][0].date, "M月")}
                </div>
              ))}
            </div>
          </div>

          {/* 热力图 */}
          <div className="flex">
            {/* 星期标签 */}
            <div className="flex flex-col gap-1 mr-2">
              {weekDays.map((day, index) => (
                <div key={index} className="h-3 text-xs text-muted-foreground flex items-center">
                  {index % 2 === 0 ? day : ""}
                </div>
              ))}
            </div>

            {/* 日期格子 */}
            <div className="flex gap-1">
              {grid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-3 h-3 rounded-sm cursor-pointer transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-primary",
                            getColorLevel(day.value)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{format(day.date, "yyyy年MM月dd日")}</p>
                        <p className="text-xs">活跃度: {day.value}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 图例 */}
          <div className="mt-2 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>少</span>
            <div className="flex gap-0.5">
              {colors.map((color, index) => (
                <div key={index} className={cn("w-3 h-3 rounded-sm", color)} />
              ))}
            </div>
            <span>多</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
