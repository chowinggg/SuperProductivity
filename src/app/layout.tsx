/**
 * ============================================
 * Root Layout 根布局
 * ============================================
 * 
 * 应用的根布局组件
 * 配置全局 Provider 和主题
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/data/query-provider";
import { ErrorBoundary } from "@/components/data/error-boundary";
import "./globals.css";

/**
 * 字体配置
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * 页面元数据
 */
export const metadata: Metadata = {
  title: {
    default: "Super Productivity - 超级生产力",
    template: "%s | Super Productivity",
  },
  description: "集成 OKR + GTD + 每日打卡 + 专注计时的全栈生产力应用",
  keywords: [
    "OKR",
    "GTD",
    "任务管理",
    "习惯追踪",
    "番茄钟",
    "生产力",
    "时间管理",
  ],
  authors: [{ name: "Super Productivity Team" }],
  creator: "Super Productivity Team",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Super Productivity",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

/**
 * 视口配置
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * 根布局组件
 * 
 * @param children - 子页面内容
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* 主题提供者 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme-preference"
        >
          {/* 数据查询提供者 */}
          <QueryProvider>
            {/* 错误边界 */}
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
