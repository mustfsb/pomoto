import type { Todo, PomodoroSession, Settings, DailyStats } from "./types"
import { DEFAULT_SETTINGS } from "./types"

const STORAGE_KEYS = {
  TODOS: "pomodoro-todos",
  SESSIONS: "pomodoro-sessions",
  SETTINGS: "pomodoro-settings",
  STATS: "pomodoro-stats",
} as const

// Todos
export function getTodos(): Todo[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.TODOS)
  if (!data) return []
  return JSON.parse(data, (key, value) => {
    if (key === "createdAt" || key === "completedAt") {
      return value ? new Date(value) : undefined
    }
    return value
  })
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos))
}

export function addTodo(todo: Omit<Todo, "id" | "createdAt" | "pomodoroCount">): Todo {
  const todos = getTodos()
  const newTodo: Todo = {
    ...todo,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    pomodoroCount: 0,
  }
  todos.push(newTodo)
  saveTodos(todos)
  return newTodo
}

export function updateTodo(id: string, updates: Partial<Todo>): void {
  const todos = getTodos()
  const index = todos.findIndex((t) => t.id === id)
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates }
    saveTodos(todos)
  }
}

export function deleteTodo(id: string): void {
  const todos = getTodos()
  saveTodos(todos.filter((t) => t.id !== id))
}

// Sessions
export function getSessions(): PomodoroSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
  if (!data) return []
  return JSON.parse(data, (key, value) => {
    if (key === "startTime" || key === "endTime") {
      return value ? new Date(value) : undefined
    }
    return value
  })
}

export function saveSessions(sessions: PomodoroSession[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
}

export function addSession(session: Omit<PomodoroSession, "id">): PomodoroSession {
  const sessions = getSessions()
  const newSession: PomodoroSession = {
    ...session,
    id: crypto.randomUUID(),
  }
  sessions.push(newSession)
  saveSessions(sessions)
  return newSession
}

export function completeSession(id: string): void {
  const sessions = getSessions()
  const index = sessions.findIndex((s) => s.id === id)
  if (index !== -1) {
    sessions[index].completed = true
    sessions[index].endTime = new Date()
    saveSessions(sessions)
  }
}

// Settings
export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (!data) return DEFAULT_SETTINGS
  return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Stats
export function getStats(): DailyStats[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.STATS)
  if (!data) return []
  return JSON.parse(data)
}

export function saveStats(stats: DailyStats[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
}

export function updateDailyStats(updates: Partial<DailyStats>): void {
  const stats = getStats()
  const today = new Date().toISOString().split("T")[0]
  const todayIndex = stats.findIndex((s) => s.date === today)

  if (todayIndex !== -1) {
    // Accumulate values instead of overwriting
    const current = stats[todayIndex]
    stats[todayIndex] = {
      ...current,
      completedPomodoros: current.completedPomodoros + (updates.completedPomodoros || 0),
      completedTodos: current.completedTodos + (updates.completedTodos || 0),
      totalFocusTime: current.totalFocusTime + (updates.totalFocusTime || 0),
      workSessions: current.workSessions + (updates.workSessions || 0),
      breakSessions: current.breakSessions + (updates.breakSessions || 0),
    }
  } else {
    stats.push({
      date: today,
      completedPomodoros: updates.completedPomodoros || 0,
      completedTodos: updates.completedTodos || 0,
      totalFocusTime: updates.totalFocusTime || 0,
      workSessions: updates.workSessions || 0,
      breakSessions: updates.breakSessions || 0,
    })
  }

  saveStats(stats)
}

export function getTodayStats(): DailyStats {
  const stats = getStats()
  const today = new Date().toISOString().split("T")[0]
  const todayStats = stats.find((s) => s.date === today)

  return (
    todayStats || {
      date: today,
      completedPomodoros: 0,
      completedTodos: 0,
      totalFocusTime: 0,
      workSessions: 0,
      breakSessions: 0,
    }
  )
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === "undefined") return
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}
