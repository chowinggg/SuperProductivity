-- ============================================
-- Super Productivity App - 完整数据库初始化
-- 可重复执行（使用 IF NOT EXISTS）
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 枚举类型
-- ============================================

DO $$
BEGIN
  -- 任务状态
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('inbox', 'next_action', 'waiting', 'scheduled', 'someday', 'completed', 'cancelled');
  END IF;

  -- 任务优先级
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low', 'none');
  END IF;

  -- 习惯频率
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_frequency') THEN
    CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly', 'custom');
  END IF;

  -- 专注状态
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'focus_session_status') THEN
    CREATE TYPE focus_session_status AS ENUM ('in_progress', 'completed', 'interrupted');
  END IF;

  -- 度量类型
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'key_result_metric_type') THEN
    CREATE TYPE key_result_metric_type AS ENUM ('number', 'percentage', 'currency', 'boolean');
  END IF;
END $$;

-- ============================================
-- 表结构
-- ============================================

-- Objectives 表
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Key Results 表
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  metric_type key_result_metric_type DEFAULT 'number',
  start_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Projects 表
CREATE TABLE IF NOT EXISTS projects (
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

-- Tasks 表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'inbox',
  priority task_priority DEFAULT 'none',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  key_result_id UUID REFERENCES key_results(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  due_date TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habits 表
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency habit_frequency DEFAULT 'daily',
  week_days INTEGER[],
  month_days INTEGER[],
  target_times INTEGER DEFAULT 1,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  linked_task_template JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habit Logs 表
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  count INTEGER DEFAULT 0,
  note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- Focus Sessions 表
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'pomodoro' CHECK (type IN ('pomodoro', 'short_break', 'long_break', 'free')),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT,
  planned_duration INTEGER NOT NULL,
  actual_duration INTEGER DEFAULT 0,
  status focus_session_status DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  interruption_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Habit Links 表
CREATE TABLE IF NOT EXISTS task_habit_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, habit_id)
);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_objectives_user_id ON objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_objectives_quarter ON objectives(quarter);
CREATE INDEX IF NOT EXISTS idx_key_results_objective_id ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_log_date ON habit_logs(log_date);

-- ============================================
-- RLS 策略
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

-- 删除旧策略（如果存在）然后创建新策略
DO $$
BEGIN
  -- Objectives
  DROP POLICY IF EXISTS "Users can view own objectives" ON objectives;
  DROP POLICY IF EXISTS "Users can insert own objectives" ON objectives;
  DROP POLICY IF EXISTS "Users can update own objectives" ON objectives;
  DROP POLICY IF EXISTS "Users can delete own objectives" ON objectives;
  
  CREATE POLICY "Users can view own objectives" ON objectives FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY "Users can insert own objectives" ON objectives FOR INSERT WITH CHECK (user_id = auth.uid());
  CREATE POLICY "Users can update own objectives" ON objectives FOR UPDATE USING (user_id = auth.uid());
  CREATE POLICY "Users can delete own objectives" ON objectives FOR DELETE USING (user_id = auth.uid());

  -- Tasks
  DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
  
  CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
  CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (user_id = auth.uid());
  CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (user_id = auth.uid());

  -- Habits
  DROP POLICY IF EXISTS "Users can view own habits" ON habits;
  DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
  DROP POLICY IF EXISTS "Users can update own habits" ON habits;
  DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
  
  CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (user_id = auth.uid());
  CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (user_id = auth.uid());
  CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (user_id = auth.uid());
END $$;

-- ============================================
-- 触发器
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_objectives_updated_at ON objectives;
  DROP TRIGGER IF EXISTS update_key_results_updated_at ON key_results;
  DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
  DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
  DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
  DROP TRIGGER IF EXISTS update_habit_logs_updated_at ON habit_logs;
  DROP TRIGGER IF EXISTS update_focus_sessions_updated_at ON focus_sessions;

  CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_key_results_updated_at BEFORE UPDATE ON key_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_habit_logs_updated_at BEFORE UPDATE ON habit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_focus_sessions_updated_at BEFORE UPDATE ON focus_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- ============================================
-- 完成！
-- ============================================
SELECT 'Database initialization completed!' as status;
