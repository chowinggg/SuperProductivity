/**
 * ============================================
 * Objective List 组件
 * ============================================
 * 
 * OKR 目标列表，支持拖拽排序
 */

"use client";

import * as React from "react";
import { ObjectiveCard } from "./objective-card";
import { ObjectiveForm } from "./objective-form";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/use-objectives";
import { useToast } from "@/hooks/use-toast";
import type { Objective, CreateObjectiveInput, UpdateObjectiveInput } from "@/types/supabase";
import { Plus } from "lucide-react";

interface ObjectiveListProps {
  quarter?: string;
}

export function ObjectiveList({ quarter }: ObjectiveListProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingObjective, setEditingObjective] = React.useState<Objective | null>(null);
  
  const { data: objectives, isLoading, error } = useObjectives(quarter);
  const createMutation = useCreateObjective();
  const updateMutation = useUpdateObjective();
  const deleteMutation = useDeleteObjective();
  const { toast } = useToast();

  const handleCreate = async (data: CreateObjectiveInput) => {
    try {
      await createMutation.mutateAsync(data);
      setFormOpen(false);
      toast({
        title: "创建成功",
        description: "目标已创建",
      });
    } catch (error) {
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (data: CreateObjectiveInput) => {
    if (!editingObjective) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingObjective.id,
        input: data as UpdateObjectiveInput,
      });
      setFormOpen(false);
      setEditingObjective(null);
      toast({
        title: "更新成功",
        description: "目标已更新",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个目标吗？")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "删除成功",
        description: "目标已删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingObjective(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">加载失败: {error.message}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          重试
        </Button>
      </div>
    );
  }

  if (!objectives?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">还没有目标，创建第一个吧！</p>
        <Button className="mt-4" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建目标
        </Button>
        
        <ObjectiveForm
          open={formOpen}
          onOpenChange={handleOpenChange}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建目标
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {objectives.map((objective) => (
          <ObjectiveCard
            key={objective.id}
            objective={objective}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ObjectiveForm
        open={formOpen}
        onOpenChange={handleOpenChange}
        objective={editingObjective}
        onSubmit={editingObjective ? handleUpdate : handleCreate}
        isSubmitting={
          editingObjective ? updateMutation.isPending : createMutation.isPending
        }
      />
    </div>
  );
}
