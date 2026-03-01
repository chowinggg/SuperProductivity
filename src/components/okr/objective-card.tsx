/**
 * ============================================
 * Objective Card 组件
 * ============================================
 * 
 * 显示单个 OKR 目标的卡片
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/progress";
import type { Objective, KeyResult } from "@/types/supabase";
import {
  MoreHorizontal,
  Target,
  ChevronDown,
  ChevronUp,
  Edit,
  Archive,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ObjectiveCardProps {
  objective: Objective & { key_results?: KeyResult[] };
  onEdit?: (objective: Objective) => void;
  onArchive?: (id: string, archived: boolean) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ObjectiveCard({
  objective,
  onEdit,
  onArchive,
  onDelete,
  className,
}: ObjectiveCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const keyResults = objective.key_results || [];
  const completedKRs = keyResults.filter((kr) => kr.is_completed).length;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-okr/10">
            <Target className="h-5 w-5 text-okr" />
          </div>
          <div>
            <h3 className="font-semibold">{objective.title}</h3>
            {objective.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {objective.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{objective.quarter}</Badge>
              <span className="text-xs text-muted-foreground">
                {completedKRs}/{keyResults.length} 关键结果
              </span>
            </div>
          </div>
        </div>

        {/* 操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(objective)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onArchive?.(objective.id, !objective.is_archived)}
            >
              <Archive className="mr-2 h-4 w-4" />
              {objective.is_archived ? "取消归档" : "归档"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete?.(objective.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 进度 */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">总进度</span>
          <span className="text-sm text-muted-foreground">
            {objective.progress}%
          </span>
        </div>
        <Progress value={objective.progress} className="h-2" />
      </div>

      {/* 关键结果列表 */}
      {keyResults.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground"
          >
            <span>关键结果</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              {keyResults.map((kr) => (
                <div
                  key={kr.id}
                  className="flex items-center gap-3 rounded-md bg-muted/50 p-3"
                >
                  <CircularProgress
                    value={kr.progress}
                    size={36}
                    strokeWidth={3}
                    variant={kr.is_completed ? "success" : "default"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{kr.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {kr.current_value} / {kr.target_value} {kr.unit || ""}
                    </p>
                  </div>
                  {kr.is_completed && (
                    <Badge variant="habit" className="shrink-0">
                      完成
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
