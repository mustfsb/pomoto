"use client"

import { usePomodoro } from "@/hooks/use-pomodoro"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, SkipForward, Timer } from "lucide-react"
import { useEffect } from "react"
import { FocusModeOverlay } from "@/components/focus-mode-overlay"

export function PomodoroTimer() {
  const {
    timerState,
    sessionType,
    timeLeft,
    completedWorkSessions,
    start,
    pause,
    reset,
    skip,
    formatTime,
    getProgress,
    settings,
  } = usePomodoro()

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Update document title with timer
  useEffect(() => {
    if (timerState === "running") {
      document.title = `${formatTime(timeLeft)} - ${sessionType === "work" ? "Focus" : "Break"}`
    } else {
      document.title = "Pomodoro & Todo App"
    }
  }, [timerState, timeLeft, sessionType, formatTime])

  if (!settings) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Card>
    )
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case "work":
        return "text-primary"
      case "short-break":
        return "text-accent"
      case "long-break":
        return "text-success"
    }
  }

  const getSessionLabel = () => {
    switch (sessionType) {
      case "work":
        return "Focus Time"
      case "short-break":
        return "Short Break"
      case "long-break":
        return "Long Break"
    }
  }

  const isFocusModeActive = settings.focusModeEnabled && timerState === "running" && sessionType === "work"

  return (
    <>
      <FocusModeOverlay isActive={isFocusModeActive} />

      <Card
        className={`p-8 border-0 shadow-none transition-all duration-1000 ${isFocusModeActive ? "relative z-50" : ""}`}
      >
        <div className="flex flex-col items-center gap-8">
          {/* Session Type */}
          <div className="flex items-center gap-2">
            <Timer className={`h-5 w-5 ${getSessionColor()}`} />
            <h2 className={`text-xl font-semibold ${getSessionColor()}`}>{getSessionLabel()}</h2>
          </div>

          {/* Timer Display */}
          <div className="relative">
            <div className="text-7xl font-bold tabular-nums tracking-tight md:text-8xl">{formatTime(timeLeft)}</div>
            {timerState === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-lg bg-warning/20 px-3 py-1 text-sm font-medium text-warning-foreground">
                  Paused
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Session Counter */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Completed sessions:</span>
            <span className="font-semibold text-foreground">{completedWorkSessions}</span>
            <span className="text-xs">
              (Next long break in {settings.longBreakInterval - (completedWorkSessions % settings.longBreakInterval)})
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {timerState === "idle" || timerState === "paused" ? (
              <Button onClick={start} size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                {timerState === "idle" ? "Start" : "Resume"}
              </Button>
            ) : (
              <Button onClick={pause} size="lg" variant="secondary" className="gap-2">
                <Pause className="h-5 w-5" />
                Pause
              </Button>
            )}

            <Button
              onClick={reset}
              size="lg"
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={timerState === "idle"}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={skip}
              size="lg"
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={timerState === "idle"}
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>

          {/* Session Info */}
          <div className="grid w-full max-w-md grid-cols-3 gap-4 rounded-lg bg-surface-container-high p-4 text-center text-sm">
            <div>
              <div className="font-semibold text-primary">{settings.workDuration}m</div>
              <div className="text-muted-foreground">Focus</div>
            </div>
            <div>
              <div className="font-semibold text-accent">{settings.shortBreakDuration}m</div>
              <div className="text-muted-foreground">Short Break</div>
            </div>
            <div>
              <div className="font-semibold text-success">{settings.longBreakDuration}m</div>
              <div className="text-muted-foreground">Long Break</div>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
