import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Timer, CheckSquare, BarChart3, TrendingUp, Clock, Target } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get today's stats from Supabase
  const today = new Date().toISOString().split("T")[0]

  const { data: todayStats } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: sessions } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5)

  const stats = todayStats || {
    completed_pomodoros: 0,
    completed_todos: 0,
    total_focus_time: 0,
    work_sessions: 0,
    break_sessions: 0,
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.email}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link href="/pomodoro">
          <Button size="lg" className="gap-2">
            <Timer className="h-5 w-5" />
            Start Pomodoro
          </Button>
        </Link>
        <Link href="/todos">
          <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <CheckSquare className="h-5 w-5" />
            Todo List
          </Button>
        </Link>
        <Link href="/analytics">
          <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Button>
        </Link>
      </div>

      {/* Today's Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Today's Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Completed Pomodoros</p>
                <p className="text-2xl font-bold">{stats.completed_pomodoros}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-success/10 p-3">
                <CheckSquare className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Completed Todos</p>
                <p className="text-2xl font-bold">{stats.completed_todos}</p>
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
                <p className="text-2xl font-bold">{stats.total_focus_time}m</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-warning/10 p-3">
                <Target className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Work Sessions</p>
                <p className="text-2xl font-bold">{stats.work_sessions}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Todos */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Recent Todos</h2>
          <Card className="p-6">
            {todos && todos.length > 0 ? (
              <div className="space-y-4">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <CheckSquare
                      className={`h-5 w-5 mt-0.5 ${todo.completed ? "text-success" : "text-muted-foreground"}`}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </p>
                      {todo.description && <p className="text-sm text-muted-foreground">{todo.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No todos yet</p>
            )}
          </Card>
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Recent Sessions</h2>
          <Card className="p-6">
            {sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <Timer
                      className={`h-5 w-5 mt-0.5 ${session.session_type === "focus" ? "text-primary" : "text-accent"}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {session.session_type === "focus"
                          ? "Work"
                          : session.session_type === "short_break"
                            ? "Short Break"
                            : "Long Break"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(session.duration / 60)} minutes
                        {session.completed ? " - Completed" : " - In Progress"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No sessions started yet</p>
            )}
          </Card>
        </div>
      </div>

      {/* Motivation Card */}
      <Card className="mt-8 p-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-12 w-12 text-primary" />
          <div>
            <h3 className="text-xl font-semibold mb-1">You're doing great!</h3>
            <p className="text-muted-foreground">
              Today you completed {stats.completed_pomodoros} pomodoros and {stats.completed_todos} todos. Keep it up!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
