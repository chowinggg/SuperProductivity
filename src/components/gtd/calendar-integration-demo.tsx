/**
 * ============================================
 * Calendar Integration Demo
 * ============================================
 * 
 * 日历集成演示组件
 */

"use client";

import { PageCard } from "@/components/layout/main-layout";
import { CalendarSync, AppleCalendarGuide } from "./calendar-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CalendarIntegrationDemo() {
  const [copied, setCopied] = useState(false);
  
  // 假设的用户ID，实际应该从登录状态获取
  const userId = "demo-user-id";
  const subscribeUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/calendar?userId=${userId}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(subscribeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageCard title="📅 日历同步" description="将任务同步到系统日历">
        <div className="space-y-4">
          {/* 导出按钮 */}
          <div className="flex flex-wrap gap-2">
            <CalendarSync />
            <CalendarSync task={{
              id: "demo-task",
              title: "示例任务",
              description: "这是一个示例任务",
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              estimated_duration: 60,
            } as any} />
          </div>

          <AppleCalendarGuide />
        </div>
      </PageCard>

      <PageCard title="🔗 日历订阅链接" description="在日历 App 中添加此链接实现自动同步">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={subscribeUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Mac 日历 App：</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>打开"日历"App</li>
              <li>点击 文件 → 新建日历订阅</li>
              <li>粘贴上面的链接，点击"订阅"</li>
              <li>设置自动刷新频率（建议每小时）</li>
            </ol>
            
            <p className="mt-4"><strong>iPhone/iPad：</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>打开 设置 → 日历 → 账户 → 添加账户 → 其他</li>
              <li>选择"添加已订阅的日历"</li>
              <li>粘贴上面的链接</li>
              <li>点击"下一步"完成添加</li>
            </ol>
          </div>
        </div>
      </PageCard>
    </div>
  );
}
