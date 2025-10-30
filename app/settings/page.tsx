import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-balance">Settings</h1>
        <p className="text-muted-foreground text-balance">Customize your Pomodoro experience</p>
      </div>

      <SettingsForm />
    </div>
  )
}
