/**
 * ============================================
 * useTasks Hook
 * ============================================
 * 
 * 用于管理 GTD 任务的 React Query Hooks
 * 包含查询、创建、更新、删除和乐观更新
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskFilter,
} from "@/types/supabase";
import { startOfDay, endOfDay, formatISO } from "date-fns";

// ============================================
// 查询 Hooks
// ============================================

/**
 * 获取任务列表
 * 
 * @param filter - 筛选条件
 * @returns 任务列表
 */
export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filter as Record<string, unknown>),
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          project:projects(id, name),
          key_result:key_results(id, title),
          subtasks:tasks(*)
        `)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      // 应用筛选条件
      if (filter?.status) {
        if (Array.isArray(filter.status)) {
          query = query.in("status", filter.status);
        } else {
          query = query.eq("status", filter.status);
        }
      }

      if (filter?.project_id !== undefined) {
        if (filter.project_id === null) {
          query = query.is("project_id", null);
        } else {
          query = query.eq("project_id", filter.project_id);
        }
      }

      if (filter?.key_result_id !== undefined) {
        if (filter.key_result_id === null) {
          query = query.is("key_result_id", null);
        } else {
          query = query.eq("key_result_id", filter.key_result_id);
        }
      }

      if (filter?.parent_id !== undefined) {
        if (filter.parent_id === null) {
          query = query.is("parent_id", null);
        } else {
          query = query.eq("parent_id", filter.parent_id);
        }
      }

      if (filter?.priority) {
        if (Array.isArray(filter.priority)) {
          query = query.in("priority", filter.priority);
        } else {
          query = query.eq("priority", filter.priority);
        }
      }

      if (filter?.due_before) {
        query = query.lte("due_date", filter.due_before);
      }

      if (filter?.due_after) {
        query = query.gte("due_date", filter.due_after);
      }

      if (filter?.is_completed !== undefined) {
        if (filter.is_completed) {
          query = query.not("completed_at", "is", null);
        } else {
          query = query.is("completed_at", null);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取任务失败: ${error.message}`);
      }

      return data as Task[];
    },
  });
}

/**
 * 获取单个任务详情
 * 
 * @param id - 任务 ID
 * @returns 任务详情
 */
export function useTask(id: string | null) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          project:projects(id, name),
          key_result:key_results(id, title),
          subtasks:tasks(*),
          parent:tasks(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`获取任务详情失败: ${error.message}`);
      }

      return data as Task;
    },
    enabled: !!id,
  });
}

/**
 * 获取收集箱任务
 */
export function useInboxTasks() {
  return useTasks({ status: "inbox" });
}

/**
 * 获取今日任务
 */
export function useTodayTasks() {
  const today = new Date();
  const start = formatISO(startOfDay(today));
  const end = formatISO(endOfDay(today));

  return useQuery({
    queryKey: queryKeys.tasks.today(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          project:projects(id, name),
          key_result:key_results(id, title)
        `)
        .is("deleted_at", null)
        .is("completed_at", null)
        .or(`due_date.gte.${start},due_date.lte.${end},status.eq.next_action`)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true });

      if (error) {
        throw new Error(`获取今日任务失败: ${error.message}`);
      }

      return data as Task[];
    },
  });
}

// ============================================
// 变更 Hooks
// ============================================

/**
 * 创建任务
 * 
 * 支持乐观更新
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(input as never)
        .select()
        .single();

      if (error) {
        throw new Error(`创建任务失败: ${error.message}`);
      }

      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.setQueryData(queryKeys.tasks.detail(data.id), data);
      
      // 如果有关联项目，刷新项目任务列表
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.tasks(data.project_id),
        });
      }
    },
  });
}

/**
 * 更新任务
 * 
 * 支持乐观更新
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTaskInput;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新任务失败: ${error.message}`);
      }

      return data as Task;
    },
    // 乐观更新
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTask = queryClient.getQueryData<Task>(queryKeys.tasks.detail(id));

      queryClient.setQueryData<Task>(queryKeys.tasks.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...input } as Task;
      });

      return { previousTask };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(id), context.previousTask);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * 切换任务完成状态
 * 
 * 支持乐观更新
 */
export function useToggleTaskComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const updateData = completed
        ? { completed_at: new Date().toISOString(), status: "completed" as TaskStatus }
        : { completed_at: null, status: "next_action" as TaskStatus };

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新任务状态失败: ${error.message}`);
      }

      return data as Task;
    },
    // 乐观更新
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTask = queryClient.getQueryData<Task>(queryKeys.tasks.detail(id));

      queryClient.setQueryData<Task>(queryKeys.tasks.detail(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          completed_at: completed ? new Date().toISOString() : null,
          status: completed ? "completed" : "next_action",
        } as Task;
      });

      return { previousTask };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(id), context.previousTask);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * 删除任务
 * 
 * 支持乐观更新（软删除）
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("id", id);

      if (error) {
        throw new Error(`删除任务失败: ${error.message}`);
      }

      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list());

      queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (old) => {
        if (!old) return old;
        return old.filter((task) => task.id !== id);
      });

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.list(), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

// ============================================
// GTD 特定 Hooks
// ============================================

/**
 * 更新任务状态（GTD 流程）
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ status } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新任务状态失败: ${error.message}`);
      }

      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
