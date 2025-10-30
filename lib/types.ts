export interface PomodoroSession {
  id: string
  type: "work" | "short-break" | "long-break"
  duration: number // in seconds
  startTime: Date
  endTime?: Date
  completed: boolean
  todoId?: string
}

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  pomodoroCount: number
  estimatedPomodoros?: number
  priority: "low" | "medium" | "high"
  tags: string[]
}

export interface Settings {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // after how many work sessions
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  focusModeEnabled: boolean
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  completedPomodoros: number
  completedTodos: number
  totalFocusTime: number // in minutes
  workSessions: number
  breakSessions: number
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
  focusModeEnabled: false,
}
