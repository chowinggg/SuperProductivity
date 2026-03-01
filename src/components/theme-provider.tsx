/**
 * ============================================
 * Theme Provider 组件
 * ============================================
 * 
 * 包装 next-themes 的 Client Component
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ThemeProviderProps extends React.ComponentProps<typeof NextThemesProvider> {}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
