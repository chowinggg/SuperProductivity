/**
 * ============================================
 * Objectives Server Actions
 * ============================================
 * 
 * OKR 目标的 Server Actions
 * 包含 CRUD 操作和数据验证
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CreateObjectiveInput, UpdateObjectiveInput, Objective } from "@/types/supabase";

/**
 * 创建目标
 */
export async function createObjective(input: CreateObjectiveInput) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("objectives")
    .insert(input as never)
    .select()
    .single();

  if (error) {
    throw new Error(`创建目标失败: ${error.message}`);
  }

  revalidatePath("/okr");
  return data as Objective;
}

/**
 * 更新目标
 */
export async function updateObjective(id: string, input: UpdateObjectiveInput) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("objectives")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新目标失败: ${error.message}`);
  }

  revalidatePath("/okr");
  revalidatePath(`/okr/${id}`);
  return data as Objective;
}

/**
 * 删除目标（软删除）
 */
export async function deleteObjective(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("objectives")
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", id);

  if (error) {
    throw new Error(`删除目标失败: ${error.message}`);
  }

  revalidatePath("/okr");
  return { success: true };
}

/**
 * 归档/取消归档目标
 */
export async function archiveObjective(id: string, isArchived: boolean) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("objectives")
    .update({ is_archived: isArchived } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`归档目标失败: ${error.message}`);
  }

  revalidatePath("/okr");
  return data as Objective;
}

/**
 * 更新目标排序
 */
export async function reorderObjectives(orderedIds: string[]) {
  const supabase = await createClient();
  
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  const { error } = await supabase
    .from("objectives")
    .upsert(updates as never);

  if (error) {
    throw new Error(`更新排序失败: ${error.message}`);
  }

  revalidatePath("/okr");
  return { success: true };
}

/**
 * 获取所有目标（服务端）
 */
export async function getObjectives(quarter?: string): Promise<Objective[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("objectives")
    .select(`
      *,
      key_results(*)
    `)
    .eq("is_archived", false)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (quarter) {
    query = query.eq("quarter", quarter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`获取目标失败: ${error.message}`);
  }

  return data || [];
}

/**
 * 获取单个目标
 */
export async function getObjective(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("objectives")
    .select(`
      *,
      key_results(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`获取目标失败: ${error.message}`);
  }

  return data;
}
