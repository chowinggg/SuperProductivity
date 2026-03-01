/**
 * ============================================
 * Habits Server Actions
 * ============================================
 * 
 * 每日习惯的 Server Actions
 * 包含 CRUD 操作和打卡功能
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { 
  CreateHabitInput, 
  UpdateHabitInput, 
  Habit, 
  HabitLog,
  CreateHabitLogInput 
} from "@/types/supabase";
import { format } from "date-fns";

/**
 * 创建习惯
 */
export async function createHabit(input: CreateHabitInput) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("habits")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`创建习惯失败: ${error.message}`);
  }

  revalidatePath("/habits");
  return data as Habit;
}

/**
 * 更新习惯
 */
export async function updateHabit(id: string, input: UpdateHabitInput) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("habits")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新习惯失败: ${error.message}`);
  }

  revalidatePath("/habits");
  revalidatePath(`/habits/${id}`);
  return data as Habit;
}

/**
 * 删除习惯（软删除）
 */
export async function deleteHabit(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("habits")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`删除习惯失败: ${error.message}`);
  }

  revalidatePath("/habits");
  return { success: true };
}

/**
 * 切换习惯启用状态
 */
export async function toggleHabitActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("habits")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新习惯状态失败: ${error.message}`);
  }

  revalidatePath("/habits");
  return data as Habit;
}

/**
 * 打卡/取消打卡
 */
export async function toggleHabitLog(
  habitId: string, 
  date: string, 
  completed: boolean,
  note?: string
) {
  const supabase = await createClient();
  
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

    revalidatePath("/habits");
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

    revalidatePath("/habits");
    return data as HabitLog;
  }
}

/**
 * 获取所有习惯
 */
export async function getHabits(options?: { isActive?: boolean }) {
  const supabase = await createClient();
  
  let query = supabase
    .from("habits")
    .select(`
      *,
      habit_logs(*)
    `)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (options?.isActive !== undefined) {
    query = query.eq("is_active", options.isActive);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`获取习惯失败: ${error.message}`);
  }

  return data || [];
}

/**
 * 获取今日习惯（包含打卡状态）
 */
export async function getTodayHabits() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // 获取所有活跃习惯
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
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
  const habitsWithTodayLog = (habits as Habit[]).map((habit) => ({
    ...habit,
    todayLog: todayLogs?.find((log) => log.habit_id === habit.id) || null,
  }));

  return habitsWithTodayLog;
}

/**
 * 获取习惯统计
 */
export async function getHabitStats(habitId: string) {
  const supabase = await createClient();
  
  // 获取最近 30 天的打卡记录
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

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
  const completionRate = Math.round((completedDays / totalDays) * 100);

  return {
    totalDays,
    completedDays,
    completionRate,
    currentStreak: 0, // 简化版，实际需要计算
    longestStreak: 0,
  };
}

/**
 * 批量打卡（用于补录）
 */
export async function batchCreateHabitLogs(
  logs: Omit<CreateHabitLogInput, "user_id" | "created_at" | "updated_at">[]
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(logs, { onConflict: "habit_id,log_date" })
    .select();

  if (error) {
    throw new Error(`批量打卡失败: ${error.message}`);
  }

  revalidatePath("/habits");
  return data as HabitLog[];
}
