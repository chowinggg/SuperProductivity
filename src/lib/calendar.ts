/**
 * ============================================
 * 日历同步工具
 * ============================================
 * 
 * 生成 iCal (.ics) 格式文件，支持导入苹果日历
 */

import type { Task } from "@/types/supabase";
import { format, addMinutes } from "date-fns";

/**
 * 生成 iCal 格式的日历事件
 * 
 * @param tasks 任务列表
 * @returns iCal 格式的字符串
 */
export function generateICal(tasks: Task[]): string {
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
  
  let icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Super Productivity App//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Super Productivity",
    "X-WR-TIMEZONE:Asia/Shanghai",
  ];

  tasks.forEach((task) => {
    if (!task.due_date && !task.scheduled_at) return;
    
    const uid = `${task.id}@super-productivity.app`;
    const startDate = task.scheduled_at || task.due_date!;
    const duration = task.estimated_duration || 30;
    const endDate = addMinutes(new Date(startDate), duration);
    
    const dtStart = format(new Date(startDate), "yyyyMMdd'T'HHmmss");
    const dtEnd = format(endDate, "yyyyMMdd'T'HHmmss");
    const dtStamp = now;
    
    // 转义特殊字符
    const summary = task.title.replace(/[\\;,:]/g, "\\$&");
    const description = (task.description || "").replace(/[\\;,:]/g, "\\$&");
    
    icalContent.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
      `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
      `DTSTAMP:${dtStamp}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `STATUS:${task.completed_at ? "COMPLETED" : "CONFIRMED"}`,
      "END:VEVENT"
    );
  });

  icalContent.push("END:VCALENDAR");
  
  return icalContent.join("\r\n");
}

/**
 * 下载 .ics 文件
 * 
 * @param tasks 任务列表
 * @param filename 文件名
 */
export function downloadICal(tasks: Task[], filename = "tasks.ics"): void {
  const icalContent = generateICal(tasks);
  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 生成单个任务的日历链接（用于直接打开）
 * 
 * @param task 任务
 * @returns Google Calendar / Outlook 链接
 */
export function generateCalendarLinks(task: Task) {
  if (!task.due_date && !task.scheduled_at) return null;
  
  const startDate = task.scheduled_at || task.due_date!;
  const duration = task.estimated_duration || 30;
  const endDate = addMinutes(new Date(startDate), duration);
  
  const title = encodeURIComponent(task.title);
  const details = encodeURIComponent(task.description || "");
  const location = encodeURIComponent("");
  
  // 格式化为 YYYYMMDDTHHMMSS
  const formatDate = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");
  const start = formatDate(new Date(startDate));
  const end = formatDate(endDate);
  
  return {
    // Google Calendar
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`,
    
    // Outlook
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate}&enddt=${endDate}&body=${details}`,
    
    // Yahoo Calendar
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${start}&et=${end}&desc=${details}`,
    
    // Apple Calendar (使用 .ics 下载)
    apple: `data:text/calendar;charset=utf8,${encodeURIComponent(generateICal([task]))}`,
  };
}
