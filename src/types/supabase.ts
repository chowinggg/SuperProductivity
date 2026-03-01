/**
 * ============================================
 * Supabase Database Type Definitions
 * ============================================
 * 
 * 此文件包含所有数据库表的 TypeScript 类型定义
 * 基于以下核心表结构：
 * - objectives: 季度目标
 * - key_results: 关键结果
 * - projects: GTD项目
 * - tasks: 任务
 * - habits: 习惯
 * - habit_logs: 每日打卡记录
 * - focus_sessions: 专注计时记录
 */

// ============================================
// 数据库类型枚举
// ============================================

/** 任务状态 - GTD 工作流 */
export type TaskStatus = 
  | 'inbox'      // 收集箱
  | 'next_action' // 下一步行动
  | 'waiting'    // 等待中
  | 'scheduled'  // 已安排
  | 'someday'    // 将来/可能
  | 'completed'  // 已完成
  | 'cancelled'; // 已取消

/** 任务优先级 */
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

/** 目标季度 */
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

/** 习惯频率类型 */
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

/** 专注会话状态 */
export type FocusSessionStatus = 'in_progress' | 'completed' | 'interrupted';

/** 关键结果度量类型 */
export type KeyResultMetricType = 'number' | 'percentage' | 'currency' | 'boolean';

// ============================================
// 基础接口定义
// ============================================

/** 软删除和时间戳基础 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** 用户关联基础 */
export interface UserOwnedEntity extends BaseEntity {
  user_id: string;
}

// ============================================
// Objectives (季度目标)
// ============================================

/**
 * 季度目标表
 * 存储用户的 OKR 中的 O (Objectives)
 */
export interface Objective extends UserOwnedEntity {
  /** 目标标题 */
  title: string;
  /** 目标描述 */
  description: string | null;
  /** 所属季度，格式：2024-Q1 */
  quarter: string;
  /** 完成进度 0-100 */
  progress: number;
  /** 排序权重 */
  sort_order: number;
  /** 是否归档 */
  is_archived: boolean;
  /** 完成时间 */
  completed_at: string | null;
  /** 关联的关键结果 */
  key_results?: KeyResult[];
  /** 关联的项目 */
  projects?: Project[];
}

/** 创建目标请求 */
export type CreateObjectiveInput = Omit<
  Objective,
  keyof BaseEntity | 'user_id' | 'key_results' | 'projects' | 'progress' | 'is_archived' | 'completed_at'
>;

/** 更新目标请求 */
export type UpdateObjectiveInput = Partial<Omit<CreateObjectiveInput, 'quarter'>>;

// ============================================
// Key Results (关键结果)
// ============================================

/**
 * 关键结果表
 * 存储 OKR 中的 KR，关联到具体的 Objective
 */
export interface KeyResult extends UserOwnedEntity {
  /** 关联的目标 ID */
  objective_id: string;
  /** 关键结果标题 */
  title: string;
  /** 描述 */
  description: string | null;
  /** 度量类型 */
  metric_type: KeyResultMetricType;
  /** 起始值 */
  start_value: number;
  /** 目标值 */
  target_value: number;
  /** 当前值 */
  current_value: number;
  /** 单位（如：%，元，个） */
  unit: string | null;
  /** 完成进度 0-100（自动计算） */
  progress: number;
  /** 排序权重 */
  sort_order: number;
  /** 是否完成 */
  is_completed: boolean;
  /** 完成时间 */
  completed_at: string | null;
  /** 关联的目标 */
  objective?: Objective;
  /** 关联的任务 */
  tasks?: Task[];
}

/** 创建关键结果请求 */
export type CreateKeyResultInput = Omit<
  KeyResult,
  keyof BaseEntity | 'user_id' | 'objective' | 'tasks' | 'progress' | 'is_completed' | 'completed_at'
>;

/** 更新关键结果请求 */
export type UpdateKeyResultInput = Partial<
  Omit<CreateKeyResultInput, 'objective_id'>
>;

/** 更新关键结果进度 */
export interface UpdateKeyResultProgressInput {
  current_value: number;
}

// ============================================
// Projects (GTD 项目)
// ============================================

/**
 * 项目表 - GTD 中的 Project
 * 需要多个步骤才能完成的任务集合
 */
export interface Project extends UserOwnedEntity {
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string | null;
  /** 关联的目标 ID（可选） */
  objective_id: string | null;
  /** 项目状态 */
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  /** 截止日期 */
  deadline: string | null;
  /** 完成进度 0-100 */
  progress: number;
  /** 排序权重 */
  sort_order: number;
  /** 完成时间 */
  completed_at: string | null;
  /** 关联的目标 */
  objective?: Objective;
  /** 关联的任务 */
  tasks?: Task[];
}

/** 创建项目请求 */
export type CreateProjectInput = Omit<
  Project,
  keyof BaseEntity | 'user_id' | 'objective' | 'tasks' | 'progress' | 'completed_at'
>;

/** 更新项目请求 */
export type UpdateProjectInput = Partial<Omit<CreateProjectInput, 'objective_id'>>;

// ============================================
// Tasks (任务)
// ============================================

/**
 * 任务表 - 支持嵌套和 GTD 状态流
 */
export interface Task extends UserOwnedEntity {
  /** 任务标题 */
  title: string;
  /** 任务描述/备注 */
  description: string | null;
  /** GTD 状态 */
  status: TaskStatus;
  /** 优先级 */
  priority: TaskPriority;
  /** 关联的项目 ID */
  project_id: string | null;
  /** 关联的关键结果 ID */
  key_result_id: string | null;
  /** 父任务 ID（支持嵌套） */
  parent_id: string | null;
  /** 预计时间（分钟） */
  estimated_duration: number | null;
  /** 实际时间（分钟） */
  actual_duration: number | null;
  /** 截止日期 */
  due_date: string | null;
  /** 计划开始时间 */
  scheduled_at: string | null;
  /** 完成时间 */
  completed_at: string | null;
  /** 排序权重 */
  sort_order: number;
  /** 关联的项目 */
  project?: Project;
  /** 关联的关键结果 */
  key_result?: KeyResult;
  /** 父任务 */
  parent?: Task;
  /** 子任务 */
  subtasks?: Task[];
  /** 关联的习惯 */
  habits?: TaskHabitLink[];
}

/** 创建任务请求 */
export type CreateTaskInput = Omit<
  Task,
  | keyof BaseEntity
  | 'user_id'
  | 'project'
  | 'key_result'
  | 'parent'
  | 'subtasks'
  | 'habits'
  | 'completed_at'
  | 'actual_duration'
>;

/** 更新任务请求 */
export type UpdateTaskInput = Partial<
  Omit<CreateTaskInput, 'project_id' | 'key_result_id' | 'parent_id'>
>;

/** 任务筛选条件 */
export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  project_id?: string | null;
  key_result_id?: string | null;
  parent_id?: string | null;
  priority?: TaskPriority | TaskPriority[];
  due_before?: string;
  due_after?: string;
  is_completed?: boolean;
}

// ============================================
// Habits (习惯)
// ============================================

/**
 * 习惯表
 * 定义需要每日/定期打卡的习惯
 */
export interface Habit extends UserOwnedEntity {
  /** 习惯名称 */
  name: string;
  /** 习惯描述 */
  description: string | null;
  /** 频率类型 */
  frequency: HabitFrequency;
  /** 每周具体日期（1-7，周一到周日） */
  week_days: number[] | null;
  /** 每月具体日期（1-31） */
  month_days: number[] | null;
  /** 目标次数（如：每周3次） */
  target_times: number;
  /** 颜色标识 */
  color: string | null;
  /** 图标 */
  icon: string | null;
  /** 排序权重 */
  sort_order: number;
  /** 是否启用 */
  is_active: boolean;
  /** 关联的任务模板（创建习惯时自动生成任务） */
  linked_task_template: CreateTaskInput | null;
  /** 打卡记录 */
  logs?: HabitLog[];
  /** 关联的任务 */
  linked_tasks?: TaskHabitLink[];
  /** 当前连续打卡天数 */
  current_streak?: number;
  /** 最长连续打卡天数 */
  longest_streak?: number;
}

/** 创建习惯请求 */
export type CreateHabitInput = Omit<
  Habit,
  | keyof BaseEntity
  | 'user_id'
  | 'logs'
  | 'linked_tasks'
  | 'current_streak'
  | 'longest_streak'
>;

/** 更新习惯请求 */
export type UpdateHabitInput = Partial<CreateHabitInput>;

// ============================================
// Habit Logs (习惯打卡记录)
// ============================================

/**
 * 习惯打卡记录表
 * 每日打卡数据
 */
export interface HabitLog extends UserOwnedEntity {
  /** 关联的习惯 ID */
  habit_id: string;
  /** 打卡日期（YYYY-MM-DD） */
  log_date: string;
  /** 是否完成 */
  is_completed: boolean;
  /** 完成次数（用于支持多次打卡的习惯） */
  count: number;
  /** 备注 */
  note: string | null;
  /** 完成时间戳 */
  completed_at: string | null;
  /** 关联的习惯 */
  habit?: Habit;
}

/** 创建打卡记录请求 */
export type CreateHabitLogInput = Omit<
  HabitLog,
  keyof BaseEntity | 'user_id' | 'habit' | 'completed_at'
>;

/** 更新打卡记录请求 */
export type UpdateHabitLogInput = Partial<
  Pick<CreateHabitLogInput, 'is_completed' | 'count' | 'note'>
>;

/** 打卡统计 */
export interface HabitStats {
  /** 总打卡天数 */
  totalDays: number;
  /** 完成天数 */
  completedDays: number;
  /** 完成率 */
  completionRate: number;
  /** 当前连续天数 */
  currentStreak: number;
  /** 最长连续天数 */
  longestStreak: number;
  /** 本周完成率 */
  thisWeekRate: number;
  /** 本月完成率 */
  thisMonthRate: number;
}

// ============================================
// Task-Habit Link (任务与习惯关联)
// ============================================

/**
 * 任务与习惯的关联表
 * 用于将习惯与具体任务关联
 */
export interface TaskHabitLink extends BaseEntity {
  /** 任务 ID */
  task_id: string;
  /** 习惯 ID */
  habit_id: string;
  /** 关联的任务 */
  task?: Task;
  /** 关联的习惯 */
  habit?: Habit;
}

// ============================================
// Focus Sessions (专注计时记录)
// ============================================

/**
 * 专注会话表
 * 记录每次专注计时
 */
export interface FocusSession extends UserOwnedEntity {
  /** 会话类型：番茄钟、自由计时等 */
  type: 'pomodoro' | 'short_break' | 'long_break' | 'free';
  /** 关联的任务 ID */
  task_id: string | null;
  /** 会话标题（可选，用于无关联任务的专注） */
  title: string | null;
  /** 计划时长（分钟） */
  planned_duration: number;
  /** 实际时长（分钟） */
  actual_duration: number;
  /** 会话状态 */
  status: FocusSessionStatus;
  /** 开始时间 */
  started_at: string;
  /** 结束时间 */
  ended_at: string | null;
  /** 中断原因 */
  interruption_reason: string | null;
  /** 关联的任务 */
  task?: Task;
}

/** 创建专注会话请求 */
export type CreateFocusSessionInput = Omit<
  FocusSession,
  keyof BaseEntity | 'user_id' | 'task' | 'actual_duration' | 'ended_at' | 'interruption_reason'
>;

/** 更新专注会话请求 */
export type UpdateFocusSessionInput = Partial<
  Pick<CreateFocusSessionInput, 'status'>
>;

/** 完成专注会话请求 */
export interface CompleteFocusSessionInput {
  actual_duration: number;
  interruption_reason?: string | null;
}

/** 专注统计 */
export interface FocusStats {
  /** 今日专注时长（分钟） */
  todayMinutes: number;
  /** 本周专注时长（分钟） */
  thisWeekMinutes: number;
  /** 本月专注时长（分钟） */
  thisMonthMinutes: number;
  /** 总专注时长（分钟） */
  totalMinutes: number;
  /** 今日完成会话数 */
  todaySessions: number;
  /** 本周完成会话数 */
  thisWeekSessions: number;
  /** 平均每日专注时长 */
  averageDailyMinutes: number;
}

// ============================================
// Database Schema 类型（用于 Supabase 客户端）
// ============================================

export interface Database {
  public: {
    Tables: {
      objectives: {
        Row: Objective;
        Insert: CreateObjectiveInput;
        Update: UpdateObjectiveInput;
      };
      key_results: {
        Row: KeyResult;
        Insert: CreateKeyResultInput;
        Update: UpdateKeyResultInput;
      };
      projects: {
        Row: Project;
        Insert: CreateProjectInput;
        Update: UpdateProjectInput;
      };
      tasks: {
        Row: Task;
        Insert: CreateTaskInput;
        Update: UpdateTaskInput;
      };
      habits: {
        Row: Habit;
        Insert: CreateHabitInput;
        Update: UpdateHabitInput;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: CreateHabitLogInput;
        Update: UpdateHabitLogInput;
      };
      focus_sessions: {
        Row: FocusSession;
        Insert: CreateFocusSessionInput;
        Update: UpdateFocusSessionInput;
      };
      task_habit_links: {
        Row: TaskHabitLink;
        Insert: Omit<TaskHabitLink, keyof BaseEntity>;
        Update: Partial<Omit<TaskHabitLink, keyof BaseEntity>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_status: TaskStatus;
      task_priority: TaskPriority;
      habit_frequency: HabitFrequency;
      focus_session_status: FocusSessionStatus;
      key_result_metric_type: KeyResultMetricType;
    };
  };
}
