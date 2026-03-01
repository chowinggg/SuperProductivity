/**
 * ============================================
 * Focus Timer 专注计时器组件
 * ============================================
 * 
 * 番茄钟计时器，支持多种计时模式
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FocusSession, Task } from "@/types/supabase";
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2 } from "lucide-react";

// 计时器配置
const timerConfigs = {
  pomodoro: { minutes: 25, label: "专注", color: "text-focus", icon: Brain },
  short_break: { minutes: 5, label: "短休息", color: "text-gtd", icon: Coffee },
  long_break: { minutes: 15, label: "长休息", color: "text-okr", icon: Coffee },
  free: { minutes: 0, label: "自由", color: "text-habit", icon: Brain },
};

type TimerType = keyof typeof timerConfigs;

interface FocusTimerProps {
  task?: Task;
  onComplete?: (session: Partial<FocusSession>) => void;
  onInterrupt?: (reason: string) => void;
  className?: string;
}

export function FocusTimer({
  task,
  onComplete,
  onInterrupt,
  className,
}: FocusTimerProps) {
  const [timerType, setTimerType] = React.useState<TimerType>("pomodoro");
  const [timeLeft, setTimeLeft] = React.useState(timerConfigs.pomodoro.minutes * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [completedSessions, setCompletedSessions] = React.useState(0);

  const config = timerConfigs[timerType];
  const totalTime = config.minutes * 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 计时器逻辑
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // 计时结束
      setIsRunning(false);
      setCompletedSessions((prev) => prev + 1);
      onComplete?.({
        type: timerType,
        planned_duration: config.minutes,
        actual_duration: config.minutes,
        status: "completed",
        task_id: task?.id || null,
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft, timerType, config.minutes, onComplete, task?.id]);

  // 切换计时器类型
  const handleTypeChange = (type: TimerType) => {
    if (isRunning) {
      if (!confirm("切换计时器类型会重置当前计时，是否继续？")) return;
    }
    setTimerType(type);
    setTimeLeft(timerConfigs[type].minutes * 60);
    setIsRunning(false);
    setIsPaused(false);
  };

  // 开始/暂停
  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // 重置
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(config.minutes * 60);
  };

  // 中断
  const interruptTimer = () => {
    const reason = prompt("请输入中断原因（可选）：");
    onInterrupt?.(reason || "");
    setIsRunning(false);
    setIsPaused(false);
  };


  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* 计时器类型选择 */}
      <div className="flex gap-2 mb-8">
        {(Object.keys(timerConfigs) as TimerType[]).map((type) => (
          <Badge
            key={type}
            variant={timerType === type ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => handleTypeChange(type)}
          >
            {timerConfigs[type].label}
          </Badge>
        ))}
      </div>

      {/* 圆形计时器 */}
      <div className="relative mb-8">
        <svg width="240" height="240" className="-rotate-90">
          {/* 背景圆环 */}
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* 进度圆环 */}
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
            className={cn("transition-all duration-1000 ease-linear", config.color)}
          />
        </svg>

        {/* 时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-6xl font-mono font-bold tracking-tight", config.color)}>
            {formatTime(timeLeft)}
          </span>
          <span className="mt-2 text-sm text-muted-foreground">
            {config.label}模式
          </span>
          {task && (
            <span className="mt-1 text-xs text-muted-foreground truncate max-w-[180px]">
              {task.title}
            </span>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          disabled={!isRunning && timeLeft === totalTime}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full",
            isRunning && !isPaused && "bg-yellow-500 hover:bg-yellow-600"
          )}
          onClick={toggleTimer}
        >
          {isRunning && !isPaused ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        {isRunning && (
          <Button variant="destructive" size="icon" onClick={interruptTimer}>
            <CheckCircle2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* 统计信息 */}
      {completedSessions > 0 && (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-gtd" />
          <span>今日已完成 {completedSessions} 个番茄钟</span>
        </div>
      )}
    </div>
  );
}
