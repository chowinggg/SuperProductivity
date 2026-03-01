/**
 * ============================================
 * 通用工具函数
 * ============================================
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday, isYesterday, isThisWeek } from "date-fns";
import { zhCN } from "date-fns/locale";

/**
 * 合并 Tailwind 类名
 * 使用 clsx 处理条件类名，然后使用 tailwind-merge 去重和合并
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ============================================
 * 日期时间工具
 * ============================================
 */

/**
 * 格式化日期为友好显示
 * @param date - 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(d)) {
    return `今天 ${format(d, "HH:mm")}`;
  }
  
  if (isYesterday(d)) {
    return `昨天 ${format(d, "HH:mm")}`;
  }
  
  if (isThisWeek(d)) {
    return format(d, "EEEE HH:mm", { locale: zhCN });
  }
  
  return format(d, "yyyy-MM-dd HH:mm");
}

/**
 * 格式化日期为短格式
 * @param date - 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串 (MM-dd)
 */
export function formatShortDate(date: string | Date | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MM-dd");
}

/**
 * 格式化时间为 HH:mm 格式
 * @param date - 日期字符串或 Date 对象
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: string | Date | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm");
}

/**
 * 格式化时长（分钟转小时和分钟）
 * @param minutes - 分钟数
 * @returns 格式化后的时长字符串
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} 小时`;
  }
  return `${hours} 小时 ${mins} 分钟`;
}

/**
 * 获取当前季度
 * @param date - 日期，默认为今天
 * @returns 季度字符串，格式：2024-Q1
 */
export function getCurrentQuarter(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

/**
 * ============================================
 * 字符串工具
 * ============================================
 */

/**
 * 截断字符串
 * @param str - 原始字符串
 * @param maxLength - 最大长度
 * @param suffix - 后缀，默认为 "..."
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number, suffix = "..."): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 生成唯一 ID
 * @returns 唯一 ID 字符串
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 首字母大写
 * @param str - 原始字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * ============================================
 * 数字工具
 * ============================================
 */

/**
 * 格式化数字，添加千位分隔符
 * @param num - 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("zh-CN").format(num);
}

/**
 * 格式化百分比
 * @param value - 当前值
 * @param total - 总值
 * @param decimals - 小数位数，默认为 0
 * @returns 百分比字符串
 */
export function formatPercentage(value: number, total: number, decimals = 0): string {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 计算进度百分比
 * @param current - 当前值
 * @param total - 总值
 * @returns 进度值 (0-100)
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  const progress = (current / total) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * 限制数值范围
 * @param value - 原始值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * ============================================
 * 数组工具
 * ============================================
 */

/**
 * 按属性对数组进行分组
 * @param array - 原始数组
 * @param key - 分组键
 * @returns 分组后的对象
 */
export function groupBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * 数组去重
 * @param array - 原始数组
 * @param key - 用于比较的唯一键
 * @returns 去重后的数组
 */
export function uniqueBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 按多个属性排序
 * @param array - 原始数组
 * @param keys - 排序键和方向
 * @returns 排序后的数组
 */
export function sortBy<T extends Record<string, unknown>>(
  array: T[],
  ...keys: Array<{ key: keyof T; direction?: "asc" | "desc" }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, direction = "asc" } of keys) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal === bVal) continue;
      
      const comparison = aVal < bVal ? -1 : 1;
      return direction === "asc" ? comparison : -comparison;
    }
    return 0;
  });
}

/**
 * ============================================
 * 本地存储工具
 * ============================================
 */

/**
 * 安全的 localStorage 获取
 * @param key - 存储键
 * @param defaultValue - 默认值
 * @returns 解析后的值
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 安全的 localStorage 设置
 * @param key - 存储键
 * @param value - 要存储的值
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * 安全的 localStorage 删除
 * @param key - 存储键
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * ============================================
 * 验证工具
 * ============================================
 */

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证 URL 格式
 * @param url - URL 字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证是否为非空字符串
 * @param value - 要验证的值
 * @returns 是否有效
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * ============================================
 * 防抖和节流
 * ============================================
 */

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param limit - 限制时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * ============================================
 * 浏览器工具
 * ============================================
 */

/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * 下载文件
 * @param content - 文件内容
 * @param filename - 文件名
 * @param contentType - MIME 类型
 */
export function downloadFile(
  content: string,
  filename: string,
  contentType = "text/plain"
): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
