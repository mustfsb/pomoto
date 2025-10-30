import { PomodoroTimer } from "@/components/pomodoro-timer"

export default function PomodoroPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-balance">Pomodoro Timer</h1>
        <p className="text-muted-foreground text-balance">Stay focused and productive with the Pomodoro Technique</p>
      </div>

      <PomodoroTimer />
    </div>
  )
}
