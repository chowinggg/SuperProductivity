/**
 * ============================================
 * useHabits Hook
 * ============================================
 * 
 * 用于管理每日习惯的 React Query Hooks
 * 包含习惯的查询、创建、更新和每日打卡功能
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
  CreateHabitLogInput,
  HabitStats,
} from "@/types/supabase";
import { format, parseISO, startOfDay, endOfDay, subDays, isSameDay } from "date-fns";

// ============================================
// 查询 Hooks
// ============================================

/**
 * 获取所有习惯
 * 
 * @param options - 查询选项
 * @returns 习惯列表
 */
export function useHabits(options?: { isActive?: boolean }) {
  return useQuery({
    queryKey: queryKeys.habits.list({ isActive: options?.isActive }),
    queryFn: async () => {
      let query = supabase
        .from("habits")
        .select(`
          *,
          habit_logs(*)
        `)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (options?.isActive !== undefined) {
        query = query.eq("is_active", options.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取习惯失败: ${error.message}`);
      }

      return data as (Habit & { habit_logs: HabitLog[] })[];
    },
  });
}

/**
 * 获取单个习惯详情
 * 
 * @param id - 习惯 ID
 * @returns 习惯详情
 */
export function useHabit(id: string | null) {
  return useQuery({
    queryKey: queryKeys.habits.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("habits")
        .select(`
          *,
          habit_logs(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`获取习惯详情失败: ${error.message}`);
      }

      return data as Habit & { habit_logs: HabitLog[] };
    },
    enabled: !!id,
  });
}

/**
 * 获取今日习惯列表（包含打卡状态）
 */
export function useTodayHabits() {
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: queryKeys.habits.today(),
    queryFn: async () => {
      // 获取所有活跃习惯
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select(`
          *,
          habit_logs!inner(*)
        `)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (habitsError) {
        throw new Error(`获取习惯失败: ${habitsError.message}`);
      }

      // 获取今日打卡记录
      const { data: todayLogs, error: logsError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("log_date", today);

      if (logsError) {
        throw new Error(`获取打卡记录失败: ${logsError.message}`);
      }

      // 合并数据
      const habitsWithTodayLog = (habits as (Habit & { habit_logs: HabitLog[] })[]).map(
        (habit) => ({
          ...habit,
          todayLog: todayLogs?.find((log) => log.habit_id === habit.id) || null,
        })
      );

      return habitsWithTodayLog;
    },
  });
}

/**
 * 获取习惯的打卡记录
 * 
 * @param habitId - 习惯 ID
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 */
export function useHabitLogs(
  habitId: string | null,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: queryKeys.habits.logs(habitId || "", `${startDate}-${endDate}`),
    queryFn: async () => {
      if (!habitId) return [];

      let query = supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .order("log_date", { ascending: false });

      if (startDate) {
        query = query.gte("log_date", startDate);
      }

      if (endDate) {
        query = query.lte("log_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取打卡记录失败: ${error.message}`);
      }

      return data as HabitLog[];
    },
    enabled: !!habitId,
  });
}

/**
 * 获取习惯统计数据
 * 
 * @param habitId - 习惯 ID
 * @returns 统计信息
 */
export function useHabitStats(habitId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.habits.detail(habitId || ""), "stats"],
    queryFn: async () => {
      if (!habitId) return null;

      // 获取最近 30 天的打卡记录
      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");

      const { data: logs, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("is_completed", true)
        .gte("log_date", startDate)
        .lte("log_date", endDate);

      if (error) {
        throw new Error(`获取习惯统计失败: ${error.message}`);
      }

      const completedDays = logs?.length || 0;
      const totalDays = 30;
      const completionRate = (completedDays / totalDays) * 100;

      // 计算连续打卡天数
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < totalDays; i++) {
        const checkDate = format(subDays(new Date(), i), "yyyy-MM-dd");
        const hasLog = logs?.some((log) => log.log_date === checkDate);

        if (hasLog) {
          tempStreak++;
          if (i === 0) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          if (i === 0) {
            currentStreak = 0;
          }
          tempStreak = 0;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        totalDays,
        completedDays,
        completionRate: Math.round(completionRate),
        currentStreak,
        longestStreak,
        thisWeekRate: 0, // TODO: 计算本周完成率
        thisMonthRate: Math.round(completionRate),
      } as HabitStats;
    },
    enabled: !!habitId,
  });
}

// ============================================
// 变更 Hooks
// ============================================

/**
 * 创建习惯
 */
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      const { data, error } = await supabase
        .from("habits")
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`创建习惯失败: ${error.message}`);
      }

      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
    },
  });
}

/**
 * 更新习惯
 */
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateHabitInput;
    }) => {
      const { data, error } = await supabase
        .from("habits")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新习惯失败: ${error.message}`);
      }

      return data as Habit;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.detail(data.id) });
    },
  });
}

/**
 * 删除习惯
 */
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("habits")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        throw new Error(`删除习惯失败: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
    },
  });
}

// ============================================
// 打卡相关 Hooks
// ============================================

/**
 * 打卡/取消打卡
 * 
 * 支持乐观更新
 */
export function useToggleHabitLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      date,
      completed,
      note,
    }: {
      habitId: string;
      date: string;
      completed: boolean;
      note?: string;
    }) => {
      // 先查询是否已有记录
      const { data: existingLog } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("log_date", date)
        .single();

      if (existingLog) {
        // 更新现有记录
        const { data, error } = await supabase
          .from("habit_logs")
          .update({
            is_completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
            count: completed ? 1 : 0,
            note: note || existingLog.note,
          })
          .eq("id", existingLog.id)
          .select()
          .single();

        if (error) {
          throw new Error(`更新打卡记录失败: ${error.message}`);
        }

        return data as HabitLog;
      } else {
        // 创建新记录
        const { data, error } = await supabase
          .from("habit_logs")
          .insert({
            habit_id: habitId,
            log_date: date,
            is_completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
            count: completed ? 1 : 0,
            note: note || null,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`创建打卡记录失败: ${error.message}`);
        }

        return data as HabitLog;
      }
    },
    // 乐观更新
    onMutate: async ({ habitId, date, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.today() });

      const previousHabits = queryClient.getQueryData(queryKeys.habits.today());

      queryClient.setQueryData(queryKeys.habits.today(), (old: any) => {
        if (!old) return old;
        return old.map((habit: any) => {
          if (habit.id === habitId) {
            return {
              ...habit,
              todayLog: completed
                ? {
                    habit_id: habitId,
                    log_date: date,
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                    count: 1,
                  }
                : null,
            };
          }
          return habit;
        });
      });

      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKeys.habits.today(), context.previousHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habitLogs.all });
    },
  });
}

/**
 * 批量打卡
 * 
 * 用于快速补录多日打卡
 */
export function useBatchCreateHabitLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      logs: Omit<CreateHabitLogInput, "user_id" | "created_at" | "updated_at">[]
    ) => {
      const { data, error } = await supabase
        .from("habit_logs")
        .upsert(logs, { onConflict: "habit_id,log_date" })
        .select();

      if (error) {
        throw new Error(`批量打卡失败: ${error.message}`);
      }

      return data as HabitLog[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.habitLogs.all });
    },
  });
}
