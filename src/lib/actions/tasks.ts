/**
 * ============================================
 * Tasks Server Actions
 * ============================================
 * 
 * GTD 任务的 Server Actions
 * 包含 CRUD 操作和数据验证
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CreateTaskInput, UpdateTaskInput, Task, TaskStatus } from "@/types/supabase";
import { startOfDay, endOfDay, formatISO } from "date-fns";

/**
 * 创建任务
 */
export async function createTask(input: CreateTaskInput) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("tasks")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`创建任务失败: ${error.message}`);
  }

  revalidatePath("/gtd");
  return data as Task;
}

/**
 * 更新任务
 */
export async function updateTask(id: string, input: UpdateTaskInput) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新任务失败: ${error.message}`);
  }

  revalidatePath("/gtd");
  revalidatePath(`/gtd/${id}`);
  return data as Task;
}

/**
 * 删除任务（软删除）
 */
export async function deleteTask(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`删除任务失败: ${error.message}`);
  }

  revalidatePath("/gtd");
  return { success: true };
}

/**
 * 切换任务完成状态
 */
export async function toggleTaskComplete(id: string, completed: boolean) {
  const supabase = await createClient();
  
  const updateData = completed
    ? { completed_at: new Date().toISOString(), status: "completed" as TaskStatus }
    : { completed_at: null, status: "next_action" as TaskStatus };

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新任务状态失败: ${error.message}`);
  }

  revalidatePath("/gtd");
  return data as Task;
}

/**
 * 更新任务状态（GTD 流程）
 */
export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新任务状态失败: ${error.message}`);
  }

  revalidatePath("/gtd");
  return data as Task;
}

/**
 * 获取任务列表
 */
export async function getTasks(filter?: { status?: TaskStatus | TaskStatus[]; project_id?: string | null }) {
  const supabase = await createClient();
  
  let query = supabase
    .from("tasks")
    .select(`
      *,
      project:projects(id, name),
      key_result:key_results(id, title)
    `)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

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

  const { data, error } = await query;

  if (error) {
    throw new Error(`获取任务失败: ${error.message}`);
  }

  return data || [];
}

/**
 * 获取今日任务
 */
export async function getTodayTasks() {
  const supabase = await createClient();
  const today = new Date();
  const start = formatISO(startOfDay(today));
  const end = formatISO(endOfDay(today));

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

  return data || [];
}

/**
 * 获取收集箱任务
 */
export async function getInboxTasks() {
  return getTasks({ status: "inbox" });
}

/**
 * 批量更新任务排序
 */
export async function reorderTasks(orderedIds: string[]) {
  const supabase = await createClient();
  
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  const { error } = await supabase
    .from("tasks")
    .upsert(updates);

  if (error) {
    throw new Error(`更新排序失败: ${error.message}`);
  }

  revalidatePath("/gtd");
  return { success: true };
}
