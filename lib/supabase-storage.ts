import { createBrowserClient } from "@/lib/supabase/client"
import type { Todo, PomodoroSession, DailyStats } from "./types"

// Helper to get authenticated user
async function getUser() {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")
  return user
}

// Todos
export async function getTodos(): Promise<Todo[]> {
  const supabase = createBrowserClient()
  const user = await getUser()

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  // Map database fields to app types
  return (data || []).map((todo) => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    priority: todo.priority as "low" | "medium" | "high",
    estimatedPomodoros: todo.estimated_pomodoros,
    pomodoroCount: todo.completed_pomodoros,
    tags: todo.tags || [],
    createdAt: new Date(todo.created_at),
    completedAt: todo.completed_at ? new Date(todo.completed_at) : undefined,
  }))
}

export async function addTodo(todo: Omit<Todo, "id" | "createdAt" | "pomodoroCount">): Promise<Todo> {
  const supabase = createBrowserClient()
  const user = await getUser()

  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      estimated_pomodoros: todo.estimatedPomodoros,
      completed_pomodoros: 0,
      tags: todo.tags,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    completed: data.completed,
    priority: data.priority as "low" | "medium" | "high",
    estimatedPomodoros: data.estimated_pomodoros,
    pomodoroCount: data.completed_pomodoros,
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
  }
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  const supabase = createBrowserClient()

  // Map app fields to database fields
  const dbUpdates: any = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority
  if (updates.estimatedPomodoros !== undefined) dbUpdates.estimated_pomodoros = updates.estimatedPomodoros
  if (updates.pomodoroCount !== undefined) dbUpdates.completed_pomodoros = updates.pomodoroCount
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt?.toISOString()

  const { error } = await supabase.from("todos").update(dbUpdates).eq("id", id)

  if (error) throw error
}

export async function deleteTodo(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("todos").delete().eq("id", id)

  if (error) throw error
}

// Sessions
export async function getSessions(): Promise<PomodoroSession[]> {
  const supabase = createBrowserClient()
  const user = await getUser()

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })

  if (error) throw error

  // Map database fields to app types
  return (data || []).map((session) => ({
    id: session.id,
    type:
      session.session_type === "focus"
        ? "work"
        : (session.session_type.replace("_", "-") as "work" | "short-break" | "long-break"),
    duration: session.duration,
    startTime: new Date(session.started_at),
    endTime: session.completed_at ? new Date(session.completed_at) : undefined,
    completed: session.completed,
    todoId: session.todo_id,
  }))
}

export async function addSession(session: Omit<PomodoroSession, "id">): Promise<PomodoroSession> {
  const supabase = createBrowserClient()
  const user = await getUser()

  // Map app type to database type
  const sessionType = session.type === "work" ? "focus" : session.type.replace("-", "_")

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({
      user_id: user.id,
      todo_id: session.todoId,
      duration: session.duration,
      session_type: sessionType,
      completed: session.completed,
      started_at: session.startTime.toISOString(),
      completed_at: session.endTime?.toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    type:
      data.session_type === "focus"
        ? "work"
        : (data.session_type.replace("_", "-") as "work" | "short-break" | "long-break"),
    duration: data.duration,
    startTime: new Date(data.started_at),
    endTime: data.completed_at ? new Date(data.completed_at) : undefined,
    completed: data.completed,
    todoId: data.todo_id,
  }
}

export async function completeSession(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from("pomodoro_sessions")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw error
}

// Daily Stats
export async function updateDailyStats(updates: Partial<DailyStats>): Promise<void> {
  const supabase = createBrowserClient()
  const user = await getUser()
  const today = new Date().toISOString().split("T")[0]

  // Try to get existing stats for today
  const { data: existing } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  if (existing) {
    // Update existing stats (accumulate values)
    const { error } = await supabase
      .from("daily_stats")
      .update({
        completed_pomodoros: existing.completed_pomodoros + (updates.completedPomodoros || 0),
        completed_todos: existing.completed_todos + (updates.completedTodos || 0),
        total_focus_time: existing.total_focus_time + (updates.totalFocusTime || 0),
        work_sessions: existing.work_sessions + (updates.workSessions || 0),
        break_sessions: existing.break_sessions + (updates.breakSessions || 0),
      })
      .eq("id", existing.id)

    if (error) throw error
  } else {
    // Create new stats for today
    const { error } = await supabase.from("daily_stats").insert({
      user_id: user.id,
      date: today,
      completed_pomodoros: updates.completedPomodoros || 0,
      completed_todos: updates.completedTodos || 0,
      total_focus_time: updates.totalFocusTime || 0,
      work_sessions: updates.workSessions || 0,
      break_sessions: updates.breakSessions || 0,
    })

    if (error) throw error
  }
}

export async function getTodayStats(): Promise<DailyStats> {
  const supabase = createBrowserClient()
  const user = await getUser()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase.from("daily_stats").select("*").eq("user_id", user.id).eq("date", today).maybeSingle()

  if (data) {
    return {
      date: data.date,
      completedPomodoros: data.completed_pomodoros,
      completedTodos: data.completed_todos,
      totalFocusTime: data.total_focus_time,
      workSessions: data.work_sessions,
      breakSessions: data.break_sessions,
    }
  }

  return {
    date: today,
    completedPomodoros: 0,
    completedTodos: 0,
    totalFocusTime: 0,
    workSessions: 0,
    breakSessions: 0,
  }
}

export async function getStats(): Promise<DailyStats[]> {
  const supabase = createBrowserClient()
  const user = await getUser()

  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30)

  if (error) throw error

  return (data || []).map((stat) => ({
    date: stat.date,
    completedPomodoros: stat.completed_pomodoros,
    completedTodos: stat.completed_todos,
    totalFocusTime: stat.total_focus_time,
    workSessions: stat.work_sessions,
    breakSessions: stat.break_sessions,
  }))
}
