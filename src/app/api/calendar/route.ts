/**
 * ============================================
 * Calendar API Route
 * ============================================
 * 
 * 提供日历订阅链接，支持自动同步
 * URL: /api/calendar?userId=xxx
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateICal } from "@/lib/calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    const supabase = await createClient();
    
    // 获取用户的所有任务（带时间安排）
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .not("due_date", "is", null)
      .is("deleted_at", null)
      .order("due_date", { ascending: true });

    if (error) {
      throw error;
    }

    // 生成 iCal 内容
    const icalContent = generateICal(tasks || []);
    
    // 返回 iCal 格式
    return new NextResponse(icalContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="my-tasks.ics"',
        // 允许跨域
        "Access-Control-Allow-Origin": "*",
        // 缓存 5 分钟
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
