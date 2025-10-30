"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { getStats } from "@/lib/storage"
import type { DailyStats } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Calendar, Timer, CheckCircle2, TrendingUp, Clock, Target } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DailyStats[]>([])
  const [timeRange, setTimeRange] = useState<"week" | "month">("week")

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const allStats = getStats()
    setStats(allStats)
  }

  const filteredStats = useMemo(() => {
    const days = timeRange === "week" ? 7 : 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return stats
      .filter((s) => new Date(s.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [stats, timeRange])

  const totalStats = useMemo(() => {
    return filteredStats.reduce(
      (acc, day) => ({
        completedPomodoros: acc.completedPomodoros + day.completedPomodoros,
        completedTodos: acc.completedTodos + day.completedTodos,
        totalFocusTime: acc.totalFocusTime + day.totalFocusTime,
        workSessions: acc.workSessions + day.workSessions,
        breakSessions: acc.breakSessions + day.breakSessions,
      }),
      {
        completedPomodoros: 0,
        completedTodos: 0,
        totalFocusTime: 0,
        workSessions: 0,
        breakSessions: 0,
      },
    )
  }, [filteredStats])

  const chartData = useMemo(() => {
    const days = timeRange === "week" ? 7 : 30
    const result = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayStats = filteredStats.find((s) => s.date === dateStr)

      result.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pomodoros: dayStats?.completedPomodoros || 0,
        todos: dayStats?.completedTodos || 0,
        focusTime: dayStats ? Math.round(dayStats.totalFocusTime / 60) : 0,
      })
    }

    return result
  }, [filteredStats, timeRange])

  const averages = useMemo(() => {
    const days = timeRange === "week" ? 7 : 30
    return {
      pomodorosPerDay: (totalStats.completedPomodoros / days).toFixed(1),
      todosPerDay: (totalStats.completedTodos / days).toFixed(1),
      focusTimePerDay: (totalStats.totalFocusTime / days).toFixed(0),
    }
  }, [totalStats, timeRange])

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
        <TabsList>
          <TabsTrigger value="week">Last 7 Days</TabsTrigger>
          <TabsTrigger value="month">Last 30 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Pomodoros</p>
              <p className="text-2xl font-bold">{totalStats.completedPomodoros}</p>
              <p className="text-xs text-muted-foreground">Avg: {averages.pomodorosPerDay}/day</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
              <p className="text-2xl font-bold">{totalStats.completedTodos}</p>
              <p className="text-xs text-muted-foreground">Avg: {averages.todosPerDay}/day</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Focus Time</p>
              <p className="text-2xl font-bold">{formatHours(totalStats.totalFocusTime)}</p>
              <p className="text-xs text-muted-foreground">Avg: {averages.focusTimePerDay}m/day</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pomodoros Chart */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pomodoros Completed
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="pomodoros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tasks Chart */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-success" />
            Tasks Completed
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line type="monotone" dataKey="todos" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Session Breakdown</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <span className="text-sm text-muted-foreground">Work Sessions</span>
            <span className="text-xl font-bold text-primary">{totalStats.workSessions}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <span className="text-sm text-muted-foreground">Break Sessions</span>
            <span className="text-xl font-bold text-accent">{totalStats.breakSessions}</span>
          </div>
        </div>
      </Card>

      {/* Productivity Insights */}
      {totalStats.completedPomodoros > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Productivity Insights
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="leading-relaxed text-muted-foreground">
                You've completed an average of{" "}
                <span className="font-semibold text-foreground">{averages.pomodorosPerDay}</span> pomodoros per day
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
              <p className="leading-relaxed text-muted-foreground">
                Your daily focus time averages{" "}
                <span className="font-semibold text-foreground">{averages.focusTimePerDay} minutes</span>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
              <p className="leading-relaxed text-muted-foreground">
                You're completing <span className="font-semibold text-foreground">{averages.todosPerDay}</span> tasks
                per day on average
              </p>
            </div>
          </div>
        </Card>
      )}

      {totalStats.completedPomodoros === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Data Yet</h3>
          <p className="text-muted-foreground text-balance">
            Start completing pomodoros and tasks to see your productivity analytics here.
          </p>
        </Card>
      )}
    </div>
  )
}
