/**
 * ============================================
 * Toast Hook
 * ============================================
 * 
 * 简单的 Toast 提示 Hook
 */

"use client";

import * as React from "react";
import { useState, useCallback } from "react";

export { toasts };

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

// 简单的全局状态管理
let toasts: Toast[] = [];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function useToast() {
  const [, forceUpdate] = useState({});

  // 订阅变化
  React.useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...options,
      id,
      duration: options.duration || 3000,
    };

    toasts = [...toasts, newToast];
    notifyListeners();

    // 自动移除
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notifyListeners();
    }, newToast.duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return { toast, dismiss, toasts };
}
