/**
 * ============================================
 * Theme Store - 主题状态管理
 * ============================================
 * 
 * 使用 Zustand 管理主题相关状态
 * - 侧边栏折叠状态
 * - 其他 UI 状态
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Theme Store 状态接口
 */
interface ThemeState {
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 切换侧边栏折叠状态 */
  toggleSidebar: () => void;
  /** 设置侧边栏折叠状态 */
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/**
 * 创建 Theme Store
 * 
 * 使用 persist 中间件持久化到 localStorage
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "theme-storage",
    }
  )
);
