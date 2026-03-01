-- ============================================
-- Supabase 数据库迁移脚本
-- 初始化所有表结构和 RLS 策略
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 枚举类型定义
-- ============================================

-- 任务状态枚举
CREATE TYPE task_status AS ENUM (
  'inbox',      -- 收集箱
  'next_action', -- 下一步行动
  'waiting',    -- 等待中
  'scheduled',  -- 已安排
  'someday',    -- 将来/可能
  'completed',  -- 已完成
  'cancelled'   -- 已取消
);

-- 任务优先级枚举
CREATE TYPE task_priority AS ENUM (
  'urgent',
  'high',
  'medium',
  'low',
  'none'
);

-- 习惯频率枚举
CREATE TYPE habit_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'custom'
);

-- 专注会话状态枚举
CREATE TYPE focus_session_status AS ENUM (
  'in_progress',
  'completed',
  'interrupted'
);

-- 关键结果度量类型枚举
CREATE TYPE key_result_metric_type AS ENUM (
  'number',
  'percentage',
  'currency',
  'boolean'
);

-- ============================================
-- 表结构定义
-- ============================================

-- Objectives 季度目标表
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT NOT NULL, -- 格式：2024-Q1
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Key Results 关键结果表
CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  metric_type key_result_metric_type DEFAULT 'number',
  start_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- 单位：%，元，个等
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Projects GTD 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  deadline TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Tasks 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'inbox',
  priority task_priority DEFAULT 'none',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  key_result_id UUID REFERENCES key_results(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  estimated_duration INTEGER, -- 预计时间（分钟）
  actual_duration INTEGER, -- 实际时间（分钟）
  due_date TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habits 习惯表
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency habit_frequency DEFAULT 'daily',
  week_days INTEGER[], -- 每周具体日期 1-7
  month_days INTEGER[], -- 每月具体日期 1-31
  target_times INTEGER DEFAULT 1, -- 目标次数
  color TEXT, -- 颜色标识
  icon TEXT, -- 图标名称
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  linked_task_template JSONB, -- 关联的任务模板
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habit Logs 习惯打卡记录表
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  count INTEGER DEFAULT 0, -- 完成次数
  note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 确保每个习惯每天只有一条记录
  UNIQUE(habit_id, log_date)
);

-- Focus Sessions 专注会话表
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'pomodoro' CHECK (type IN ('pomodoro', 'short_break', 'long_break', 'free')),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT,
  planned_duration INTEGER NOT NULL, -- 计划时长（分钟）
  actual_duration INTEGER DEFAULT 0, -- 实际时长（分钟）
  status focus_session_status DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  interruption_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Habit Links 任务与习惯关联表
CREATE TABLE task_habit_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, habit_id)
);

-- ============================================
-- 索引优化
-- ============================================

-- Objectives 索引
CREATE INDEX idx_objectives_user_id ON objectives(user_id);
CREATE INDEX idx_objectives_quarter ON objectives(quarter);
CREATE INDEX idx_objectives_is_archived ON objectives(is_archived) WHERE is_archived = FALSE;
CREATE INDEX idx_objectives_deleted_at ON objectives(deleted_at) WHERE deleted_at IS NULL;

-- Key Results 索引
CREATE INDEX idx_key_results_objective_id ON key_results(objective_id);
CREATE INDEX idx_key_results_user_id ON key_results(user_id);
CREATE INDEX idx_key_results_deleted_at ON key_results(deleted_at) WHERE deleted_at IS NULL;

-- Projects 索引
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_objective_id ON projects(objective_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;

-- Tasks 索引
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_key_result_id ON tasks(key_result_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at) WHERE completed_at IS NULL;
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at) WHERE deleted_at IS NULL;

-- Habits 索引
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_is_active ON habits(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_habits_deleted_at ON habits(deleted_at) WHERE deleted_at IS NULL;

-- Habit Logs 索引
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_log_date ON habit_logs(log_date);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, log_date);

-- Focus Sessions 索引
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task_id ON focus_sessions(task_id);
CREATE INDEX idx_focus_sessions_started_at ON focus_sessions(started_at);

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_habit_links ENABLE ROW LEVEL SECURITY;

-- Objectives RLS 策略
CREATE POLICY "Users can view own objectives" ON objectives
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own objectives" ON objectives
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own objectives" ON objectives
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own objectives" ON objectives
  FOR DELETE USING (user_id = auth.uid());

-- Key Results RLS 策略
CREATE POLICY "Users can view own key_results" ON key_results
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own key_results" ON key_results
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own key_results" ON key_results
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own key_results" ON key_results
  FOR DELETE USING (user_id = auth.uid());

-- Projects RLS 策略
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- Tasks RLS 策略
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (user_id = auth.uid());

-- Habits RLS 策略
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (user_id = auth.uid());

-- Habit Logs RLS 策略
CREATE POLICY "Users can view own habit_logs" ON habit_logs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own habit_logs" ON habit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own habit_logs" ON habit_logs
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own habit_logs" ON habit_logs
  FOR DELETE USING (user_id = auth.uid());

-- Focus Sessions RLS 策略
CREATE POLICY "Users can view own focus_sessions" ON focus_sessions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own focus_sessions" ON focus_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own focus_sessions" ON focus_sessions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own focus_sessions" ON focus_sessions
  FOR DELETE USING (user_id = auth.uid());

-- Task Habit Links RLS 策略
CREATE POLICY "Users can view own task_habit_links" ON task_habit_links
  FOR SELECT USING (
    task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
    OR habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own task_habit_links" ON task_habit_links
  FOR INSERT WITH CHECK (
    task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
    OR habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own task_habit_links" ON task_habit_links
  FOR DELETE USING (
    task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
    OR habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );

-- ============================================
-- 触发器函数
-- ============================================

-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加 updated_at 触发器
CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_key_results_updated_at
  BEFORE UPDATE ON key_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_sessions_updated_at
  BEFORE UPDATE ON focus_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 辅助函数
-- ============================================

-- 计算关键结果进度
CREATE OR REPLACE FUNCTION calculate_kr_progress(
  start_val NUMERIC,
  target_val NUMERIC,
  current_val NUMERIC,
  metric_type TEXT
) RETURNS INTEGER AS $$
DECLARE
  progress NUMERIC;
BEGIN
  IF target_val = start_val THEN
    RETURN 0;
  END IF;
  
  progress := ((current_val - start_val) / (target_val - start_val)) * 100;
  
  -- 布尔类型特殊处理
  IF metric_type = 'boolean' THEN
    IF current_val >= target_val THEN
      RETURN 100;
    ELSE
      RETURN 0;
    END IF;
  END IF;
  
  -- 限制在 0-100 范围内
  RETURN GREATEST(0, LEAST(100, progress::INTEGER));
END;
$$ LANGUAGE plpgsql;

-- 更新目标进度（基于关键结果的平均进度）
CREATE OR REPLACE FUNCTION update_objective_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE objectives
  SET 
    progress = COALESCE(
      (SELECT AVG(progress)::INTEGER 
       FROM key_results 
       WHERE objective_id = NEW.objective_id 
       AND deleted_at IS NULL),
      0
    ),
    updated_at = NOW()
  WHERE id = NEW.objective_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 关键结果进度更新时自动更新目标进度
CREATE TRIGGER update_objective_on_kr_change
  AFTER INSERT OR UPDATE OF progress ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION update_objective_progress();
