"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getSettings } from "@/lib/storage"
import { addSession, completeSession, updateDailyStats, updateTodo, getTodos } from "@/lib/supabase-storage"
import type { Settings } from "@/lib/types"

export type TimerState = "idle" | "running" | "paused"
export type SessionType = "work" | "short-break" | "long-break"

export function usePomodoro() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [sessionType, setSessionType] = useState<SessionType>("work")
  const [timeLeft, setTimeLeft] = useState(0)
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
    setTimeLeft(loadedSettings.workDuration * 60)
  }, [])

  // Timer logic
  useEffect(() => {
    if (timerState === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, timeLeft])

  const handleTimerComplete = useCallback(async () => {
    if (!settings) return

    try {
      if (currentSessionId) {
        await completeSession(currentSessionId)
      }

      if (sessionType === "work") {
        const focusTime = settings.workDuration
        await updateDailyStats({
          completedPomodoros: 1,
          totalFocusTime: focusTime,
          workSessions: 1,
        })

        if (selectedTodoId) {
          const todos = await getTodos()
          const todo = todos.find((t) => t.id === selectedTodoId)
          if (todo) {
            await updateTodo(selectedTodoId, {
              pomodoroCount: todo.pomodoroCount + 1,
            })
          }
        }

        setCompletedWorkSessions((prev) => prev + 1)
      } else {
        await updateDailyStats({
          breakSessions: 1,
        })
      }
    } catch (error) {
      console.error("Failed to complete session:", error)
    }

    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound()
    }

    // Show notification if enabled
    if (settings.notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: sessionType === "work" ? "Work session complete! Time for a break." : "Break complete! Ready to focus?",
          icon: "/favicon.ico",
        })
      }
    }

    // Auto-start next session if enabled
    const shouldAutoStart =
      (sessionType === "work" && settings.autoStartBreaks) || (sessionType !== "work" && settings.autoStartPomodoros)

    if (shouldAutoStart) {
      const nextType = getNextSessionType()
      startSession(nextType)
    } else {
      setTimerState("idle")
      setCurrentSessionId(null)
    }
  }, [settings, sessionType, currentSessionId, selectedTodoId, completedWorkSessions])

  const getNextSessionType = useCallback((): SessionType => {
    if (!settings) return "work"

    if (sessionType === "work") {
      if ((completedWorkSessions + 1) % settings.longBreakInterval === 0) {
        return "long-break"
      }
      return "short-break"
    }
    return "work"
  }, [sessionType, completedWorkSessions, settings])

  const startSession = useCallback(
    async (type: SessionType) => {
      if (!settings) return

      const duration =
        type === "work"
          ? settings.workDuration
          : type === "short-break"
            ? settings.shortBreakDuration
            : settings.longBreakDuration

      setSessionType(type)
      setTimeLeft(duration * 60)
      setTimerState("running")
      startTimeRef.current = new Date()

      try {
        const session = await addSession({
          type,
          duration: duration * 60,
          startTime: new Date(),
          completed: false,
          todoId: type === "work" ? selectedTodoId || undefined : undefined,
        })

        setCurrentSessionId(session.id)
      } catch (error) {
        console.error("Failed to start session:", error)
      }
    },
    [settings, selectedTodoId],
  )

  const start = useCallback(() => {
    if (timerState === "idle") {
      startSession(sessionType)
    } else if (timerState === "paused") {
      setTimerState("running")
    }
  }, [timerState, sessionType, startSession])

  const pause = useCallback(() => {
    setTimerState("paused")
  }, [])

  const reset = useCallback(() => {
    if (!settings) return

    setTimerState("idle")
    setCurrentSessionId(null)

    const duration =
      sessionType === "work"
        ? settings.workDuration
        : sessionType === "short-break"
          ? settings.shortBreakDuration
          : settings.longBreakDuration

    setTimeLeft(duration * 60)
  }, [settings, sessionType])

  const skip = useCallback(() => {
    const nextType = getNextSessionType()
    startSession(nextType)
  }, [getNextSessionType, startSession])

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const getProgress = useCallback((): number => {
    if (!settings) return 0

    const totalDuration =
      sessionType === "work"
        ? settings.workDuration * 60
        : sessionType === "short-break"
          ? settings.shortBreakDuration * 60
          : settings.longBreakDuration * 60

    return ((totalDuration - timeLeft) / totalDuration) * 100
  }, [settings, sessionType, timeLeft])

  return {
    timerState,
    sessionType,
    timeLeft,
    completedWorkSessions,
    selectedTodoId,
    setSelectedTodoId,
    start,
    pause,
    reset,
    skip,
    formatTime,
    getProgress,
    settings,
  }
}
