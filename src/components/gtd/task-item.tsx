/**
 * ============================================
 * Task Item 组件
 * ============================================
 * 
 * GTD 任务列表项
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, TaskStatus, TaskPriority } from "@/types/supabase";
import { formatDate } from "@/lib/utils";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string, completed: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  className?: string;
}

// 优先级配置
const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: "紧急", color: "bg-red-500" },
  high: { label: "高", color: "bg-orange-500" },
  medium: { label: "中", color: "bg-yellow-500" },
  low: { label: "低", color: "bg-blue-500" },
  none: { label: "无", color: "bg-gray-300" },
};

// 状态配置
const statusConfig: Record<TaskStatus, { label: string; variant: any }> = {
  inbox: { label: "收集箱", variant: "secondary" },
  next_action: { label: "下一步", variant: "default" },
  waiting: { label: "等待中", variant: "warning" },
  scheduled: { label: "已安排", variant: "info" },
  someday: { label: "将来", variant: "outline" },
  completed: { label: "已完成", variant: "success" },
  cancelled: { label: "已取消", variant: "destructive" },
};

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
  className,
}: TaskItemProps) {
  const isCompleted = !!task.completed_at;
  const priority = priorityConfig[task.priority];

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
        isCompleted && "opacity-60",
        className
      )}
    >
      {/* 完成复选框 */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => onToggle?.(task.id, checked as boolean)}
        className="mt-0.5"
      />

      {/* 内容区 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {/* 优先级指示器 */}
          <div
            className={cn("mt-2 h-2 w-2 rounded-full shrink-0", priority.color)}
            title={priority.label}
          />

          <div className="flex-1 min-w-0">
            {/* 标题 */}
            <p
              className={cn(
                "font-medium truncate",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>

            {/* 描述 */}
            {task.description && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                {task.description}
              </p>
            )}

            {/* 元信息 */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={statusConfig[task.status].variant}>
                {statusConfig[task.status].label}
              </Badge>

              {/* 截止日期 */}
              {task.due_date && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.due_date)}
                </span>
              )}

              {/* 预计时间 */}
              {task.estimated_duration && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.estimated_duration} 分钟
                </span>
              )}

              {/* 关联项目 */}
              {(task as any).project?.name && (
                <Badge variant="outline" className="text-xs">
                  {(task as any).project.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 操作菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(task)}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange?.(task.id, "next_action")}>
            <ArrowRight className="mr-2 h-4 w-4" />
            标记为下一步
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete?.(task.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
