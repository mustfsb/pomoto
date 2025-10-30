import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PomodoroSession, TodoItem, UserSettings, Statistics, TimerMode, TimerStatus } from "./types"

interface AppState {
  // Pomodoro State
  timerMode: TimerMode
  timerStatus: TimerStatus
  timeLeft: number
  currentSessionId: string | null
  pomodoroSessions: PomodoroSession[]
  completedPomodoros: number

  // Todo State
  todos: TodoItem[]
  categories: string[]

  // Settings
  settings: UserSettings

  // Statistics
  statistics: Statistics

  // Pomodoro Actions
  setTimerMode: (mode: TimerMode) => void
  setTimerStatus: (status: TimerStatus) => void
  setTimeLeft: (time: number) => void
  startSession: () => void
  completeSession: () => void
  resetTimer: () => void

  // Todo Actions
  addTodo: (todo: Omit<TodoItem, "id" | "createdAt" | "order">) => void
  updateTodo: (id: string, updates: Partial<TodoItem>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  reorderTodos: (todos: TodoItem[]) => void

  // Category Actions
  addCategory: (category: string) => void
  deleteCategory: (category: string) => void

  // Settings Actions
  updateSettings: (settings: Partial<UserSettings>) => void

  // Data Management
  exportData: () => string
  importData: (data: string) => void
  clearAllData: () => void

  // Statistics
  updateStatistics: () => void
}

const defaultSettings: UserSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  autoStartBreak: false,
  soundEnabled: true,
  notificationsEnabled: true,
  theme: "system",
}

const defaultStatistics: Statistics = {
  totalPomodoros: 0,
  totalTodos: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  productivityScore: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      timerMode: "work",
      timerStatus: "idle",
      timeLeft: 25 * 60,
      currentSessionId: null,
      pomodoroSessions: [],
      completedPomodoros: 0,
      todos: [],
      categories: ["Work", "Personal", "Study", "Other"],
      settings: defaultSettings,
      statistics: defaultStatistics,

      // Pomodoro Actions
      setTimerMode: (mode) => {
        const { settings } = get()
        const duration =
          mode === "work"
            ? settings.workDuration
            : mode === "break"
              ? settings.breakDuration
              : settings.longBreakDuration

        set({
          timerMode: mode,
          timeLeft: duration * 60,
          timerStatus: "idle",
        })
      },

      setTimerStatus: (status) => set({ timerStatus: status }),

      setTimeLeft: (time) => set({ timeLeft: time }),

      startSession: () => {
        const sessionId = `session-${Date.now()}`
        set({
          currentSessionId: sessionId,
          timerStatus: "running",
        })
      },

      completeSession: () => {
        const { currentSessionId, timerMode, settings, pomodoroSessions } = get()

        if (currentSessionId && timerMode === "work") {
          const now = Date.now()
          const session: PomodoroSession = {
            id: currentSessionId,
            startTime: now - settings.workDuration * 60 * 1000,
            endTime: now,
            duration: settings.workDuration,
            date: new Date().toISOString().split("T")[0],
            completed: true,
          }

          set({
            pomodoroSessions: [...pomodoroSessions, session],
            completedPomodoros: get().completedPomodoros + 1,
            currentSessionId: null,
          })

          get().updateStatistics()
        }
      },

      resetTimer: () => {
        const { timerMode, settings } = get()
        const duration =
          timerMode === "work"
            ? settings.workDuration
            : timerMode === "break"
              ? settings.breakDuration
              : settings.longBreakDuration

        set({
          timeLeft: duration * 60,
          timerStatus: "idle",
          currentSessionId: null,
        })
      },

      // Todo Actions
      addTodo: (todo) => {
        const { todos } = get()
        const newTodo: TodoItem = {
          ...todo,
          id: `todo-${Date.now()}`,
          createdAt: Date.now(),
          order: todos.length,
        }

        set({ todos: [...todos, newTodo] })
        get().updateStatistics()
      },

      updateTodo: (id, updates) => {
        set({
          todos: get().todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
        })
      },

      deleteTodo: (id) => {
        set({ todos: get().todos.filter((todo) => todo.id !== id) })
        get().updateStatistics()
      },

      toggleTodo: (id) => {
        const now = Date.now()
        set({
          todos: get().todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  isCompleted: !todo.isCompleted,
                  completedAt: !todo.isCompleted ? now : undefined,
                }
              : todo,
          ),
        })
        get().updateStatistics()
      },

      reorderTodos: (todos) => {
        set({ todos: todos.map((todo, index) => ({ ...todo, order: index })) })
      },

      // Category Actions
      addCategory: (category) => {
        const { categories } = get()
        if (!categories.includes(category)) {
          set({ categories: [...categories, category] })
        }
      },

      deleteCategory: (category) => {
        set({
          categories: get().categories.filter((c) => c !== category),
          todos: get().todos.map((todo) => (todo.category === category ? { ...todo, category: "Other" } : todo)),
        })
      },

      // Settings Actions
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } })
      },

      // Data Management
      exportData: () => {
        const { pomodoroSessions, todos, settings, statistics } = get()
        return JSON.stringify(
          {
            pomodoroSessions,
            todos,
            settings,
            statistics,
            exportDate: new Date().toISOString(),
          },
          null,
          2,
        )
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            pomodoroSessions: parsed.pomodoroSessions || [],
            todos: parsed.todos || [],
            settings: { ...defaultSettings, ...parsed.settings },
            statistics: { ...defaultStatistics, ...parsed.statistics },
          })
        } catch (error) {
          console.error("Failed to import data:", error)
        }
      },

      clearAllData: () => {
        set({
          pomodoroSessions: [],
          todos: [],
          completedPomodoros: 0,
          statistics: defaultStatistics,
          timerStatus: "idle",
          currentSessionId: null,
        })
      },

      // Statistics
      updateStatistics: () => {
        const { pomodoroSessions, todos } = get()

        const totalPomodoros = pomodoroSessions.filter((s) => s.completed).length
        const totalTodos = todos.filter((t) => t.isCompleted).length
        const totalFocusTime = pomodoroSessions.reduce((acc, s) => acc + s.duration, 0)

        // Calculate streak
        const today = new Date().toISOString().split("T")[0]
        const dates = [...new Set(pomodoroSessions.map((s) => s.date))].sort().reverse()

        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0

        for (let i = 0; i < dates.length; i++) {
          const date = new Date(dates[i])
          const expectedDate = new Date()
          expectedDate.setDate(expectedDate.getDate() - i)

          if (date.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
            tempStreak++
            if (i === 0 || dates[i] === today) currentStreak = tempStreak
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 0
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

        // Calculate productivity score (0-100)
        const productivityScore = Math.min(100, Math.round(totalPomodoros * 2 + totalTodos * 1.5 + currentStreak * 5))

        set({
          statistics: {
            totalPomodoros,
            totalTodos,
            currentStreak,
            longestStreak,
            totalFocusTime,
            productivityScore,
          },
        })
      },
    }),
    {
      name: "pomodoro-todo-storage",
    },
  ),
)
