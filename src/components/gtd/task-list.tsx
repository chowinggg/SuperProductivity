/**
 * ============================================
 * Task List 组件
 * ============================================
 * 
 * GTD 任务列表
 */

"use client";

import * as React from "react";
import { TaskItem } from "./task-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, useToggleTaskComplete, useDeleteTask } from "@/hooks/use-tasks";
import type { Task, TaskStatus, TaskFilter } from "@/types/supabase";
import { Plus, Inbox } from "lucide-react";

interface TaskListProps {
  filter?: TaskFilter;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onEditTask?: (task: Task) => void;
}

export function TaskList({
  filter,
  showAddButton = true,
  onAddClick,
  onEditTask,
}: TaskListProps) {
  const { data: tasks, isLoading, error } = useTasks(filter);
  const toggleMutation = useToggleTaskComplete();
  const deleteMutation = useDeleteTask();

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, completed });
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个任务吗？")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">加载失败: {error.message}</p>
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">没有任务</p>
        {showAddButton && (
          <Button className="mt-4" onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            添加任务
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={handleToggle}
          onEdit={onEditTask}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
