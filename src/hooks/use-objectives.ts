/**
 * ============================================
 * useObjectives Hook
 * ============================================
 * 
 * 用于管理 OKR 目标的 React Query Hooks
 * 包含查询、创建、更新、删除和乐观更新
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Objective,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  KeyResult,
} from "@/types/supabase";

// ============================================
// 查询 Hooks
// ============================================

/**
 * 获取所有目标
 * 
 * @param quarter - 可选的季度筛选
 * @returns 目标列表
 */
export function useObjectives(quarter?: string) {
  return useQuery({
    queryKey: queryKeys.objectives.list({ quarter }),
    queryFn: async () => {
      let query = supabase
        .from("objectives")
        .select(`
          *,
          key_results(*)
        `)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (quarter) {
        query = query.eq("quarter", quarter);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取目标失败: ${error.message}`);
      }

      return data as (Objective & { key_results: KeyResult[] })[];
    },
  });
}

/**
 * 获取单个目标详情
 * 
 * @param id - 目标 ID
 * @returns 目标详情
 */
export function useObjective(id: string | null) {
  return useQuery({
    queryKey: queryKeys.objectives.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("objectives")
        .select(`
          *,
          key_results(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`获取目标详情失败: ${error.message}`);
      }

      return data as Objective & { key_results: KeyResult[] };
    },
    enabled: !!id,
  });
}

// ============================================
// 变更 Hooks
// ============================================

/**
 * 创建目标
 * 
 * 支持乐观更新
 */
export function useCreateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateObjectiveInput) => {
      const { data, error } = await supabase
        .from("objectives")
        .insert(input as never)
        .select()
        .single();

      if (error) {
        throw new Error(`创建目标失败: ${error.message}`);
      }

      return data as Objective;
    },
    onSuccess: (data) => {
      // 更新列表缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives.all });
      // 设置新数据的缓存
      queryClient.setQueryData(queryKeys.objectives.detail(data.id), data);
    },
  });
}

/**
 * 更新目标
 * 
 * 支持乐观更新
 */
export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateObjectiveInput;
    }) => {
      const { data, error } = await supabase
        .from("objectives")
        .update(input as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新目标失败: ${error.message}`);
      }

      return data as Objective;
    },
    // 乐观更新
    onMutate: async ({ id, input }) => {
      // 取消正在进行的重新获取
      await queryClient.cancelQueries({ queryKey: queryKeys.objectives.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.objectives.all });

      // 保存之前的值
      const previousObjective = queryClient.getQueryData<Objective>(
        queryKeys.objectives.detail(id)
      );

      // 乐观更新缓存
      queryClient.setQueryData<Objective>(queryKeys.objectives.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...input } as Objective;
      });

      return { previousObjective };
    },
    onError: (_err, { id }, context) => {
      // 发生错误时回滚
      if (context?.previousObjective) {
        queryClient.setQueryData(queryKeys.objectives.detail(id), context.previousObjective);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // 无论成功还是失败，都重新获取数据
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives.all });
    },
  });
}

/**
 * 删除目标
 * 
 * 支持乐观更新（软删除）
 */
export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("objectives")
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("id", id);

      if (error) {
        throw new Error(`删除目标失败: ${error.message}`);
      }

      return id;
    },
    // 乐观更新
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.objectives.all });

      const previousObjectives = queryClient.getQueryData<Objective[]>(
        queryKeys.objectives.list()
      );

      // 从列表中移除
      queryClient.setQueryData<Objective[]>(queryKeys.objectives.list(), (old) => {
        if (!old) return old;
        return old.filter((obj) => obj.id !== id);
      });

      return { previousObjectives };
    },
    onError: (_err, _id, context) => {
      if (context?.previousObjectives) {
        queryClient.setQueryData(queryKeys.objectives.list(), context.previousObjectives);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives.all });
    },
  });
}

/**
 * 归档目标
 */
export function useArchiveObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { data, error } = await supabase
        .from("objectives")
        .update({ is_archived: isArchived } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`归档目标失败: ${error.message}`);
      }

      return data as Objective;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives.all });
    },
  });
}

// ============================================
// 辅助 Hooks
// ============================================

/**
 * 获取当前季度的目标
 */
export function useCurrentQuarterObjectives() {
  const currentQuarter = getCurrentQuarter();
  return useObjectives(currentQuarter);
}

/**
 * 获取当前季度
 */
function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}
