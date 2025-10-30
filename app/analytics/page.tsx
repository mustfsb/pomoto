import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-balance">Analytics</h1>
        <p className="text-muted-foreground text-balance">Track your productivity and progress over time</p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
