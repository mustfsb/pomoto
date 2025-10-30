import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Timer, CheckSquare, BarChart3, Settings, TrendingUp, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Hero Section */}
      <div className="mb-12 md:mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Timer className="h-4 w-4" />
          Productivity Made Simple
        </div>
        <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-balance">Focus. Achieve. Grow.</h1>
        <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground text-balance px-4">
          Master your time with the Pomodoro Technique and smart task management. Track your progress, build better
          habits, and accomplish more every day.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/login">
            <Button size="lg" className="gap-2 shadow-md w-full sm:w-auto">
              Login
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="outline" className="gap-2 shadow-sm bg-muted/30 w-full sm:w-auto">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <Link href="/pomodoro">
          <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="mb-4">
              <Timer className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="mb-2 text-xl md:text-2xl font-normal">Pomodoro Timer</h3>
            <p className="text-blue-50 text-sm md:text-base font-normal">
              Work in focused 25-minute intervals with strategic breaks to maximize productivity and prevent burnout.
            </p>
          </Card>
        </Link>

        <Link href="/todos">
          <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full rounded-3xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="mb-4">
              <CheckSquare className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="mb-2 text-xl md:text-2xl font-normal">Task Management</h3>
            <p className="text-green-50 text-sm md:text-base font-normal">
              Organize your tasks with priorities, tags, and estimated pomodoros. Track completion and stay organized.
            </p>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="mb-4">
              <BarChart3 className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="mb-2 text-xl md:text-2xl font-normal">Progress Analytics</h3>
            <p className="text-purple-50 text-sm md:text-base font-normal">
              Visualize your productivity with detailed charts, statistics, and insights into your work patterns.
            </p>
          </Card>
        </Link>

        <Card className="p-6 md:p-8 border-0 shadow-lg h-full rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="mb-4">
            <Target className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <h3 className="mb-2 text-xl md:text-2xl font-normal">Goal Tracking</h3>
          <p className="text-orange-50 text-sm md:text-base font-normal">
            Set daily and weekly goals for pomodoros and tasks. Monitor your progress and build consistent habits.
          </p>
        </Card>

        <Card className="p-6 md:p-8 border-0 shadow-lg h-full rounded-3xl bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="mb-4">
            <TrendingUp className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <h3 className="mb-2 text-xl md:text-2xl font-normal">Historical Data</h3>
          <p className="text-pink-50 text-sm md:text-base font-normal">
            All your pomodoros and tasks are saved. Review past performance and identify productivity trends.
          </p>
        </Card>

        <Link href="/settings">
          <Card className="p-6 md:p-8 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <div className="mb-4">
              <Settings className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="mb-2 text-xl md:text-2xl font-normal">Customizable</h3>
            <p className="text-teal-50 text-sm md:text-base font-normal">
              Adjust timer durations, enable auto-start, configure notifications, and personalize your experience.
            </p>
          </Card>
        </Link>
      </div>

      {/* Stats Preview */}
      <Card className="p-6 md:p-8 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-primary/5 to-blue-500/5">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to boost your productivity?</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Join thousands of users who have transformed their work habits
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-1">25</div>
            <div className="text-xs md:text-sm text-muted-foreground">Minutes Focus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">5</div>
            <div className="text-xs md:text-sm text-muted-foreground">Minutes Break</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">4</div>
            <div className="text-xs md:text-sm text-muted-foreground">Sessions/Cycle</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">∞</div>
            <div className="text-xs md:text-sm text-muted-foreground">Possibilities</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
