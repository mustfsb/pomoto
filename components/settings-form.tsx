"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { getSettings, saveSettings, clearAllData } from "@/lib/storage"
import type { Settings } from "@/lib/types"
import { Save, Trash2, AlertTriangle, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
  }

  const handleSave = () => {
    if (!settings) return

    saveSettings(settings)
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })

    // Reload the page to apply new settings
    window.location.reload()
  }

  const handleClearData = () => {
    clearAllData()
    toast({
      title: "Data cleared",
      description: "All your data has been deleted.",
      variant: "destructive",
    })

    // Reload the page
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleExportData = () => {
    const data = {
      todos: localStorage.getItem("pomodoro-todos"),
      sessions: localStorage.getItem("pomodoro-sessions"),
      settings: localStorage.getItem("pomodoro-settings"),
      stats: localStorage.getItem("pomodoro-stats"),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pomodoro-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your data has been downloaded successfully.",
    })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.todos) localStorage.setItem("pomodoro-todos", data.todos)
        if (data.sessions) localStorage.setItem("pomodoro-sessions", data.sessions)
        if (data.settings) localStorage.setItem("pomodoro-settings", data.settings)
        if (data.stats) localStorage.setItem("pomodoro-stats", data.stats)

        toast({
          title: "Data imported",
          description: "Your data has been restored successfully.",
        })

        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  if (!settings) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timer Settings */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Timer Settings</h2>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    workDuration: Number.parseInt(e.target.value) || 25,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-break">Short Break (minutes)</Label>
              <Input
                id="short-break"
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shortBreakDuration: Number.parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break">Long Break (minutes)</Label>
              <Input
                id="long-break"
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    longBreakDuration: Number.parseInt(e.target.value) || 15,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="long-break-interval">Long Break Interval</Label>
            <Input
              id="long-break-interval"
              type="number"
              min="2"
              max="10"
              value={settings.longBreakInterval}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  longBreakInterval: Number.parseInt(e.target.value) || 4,
                })
              }
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">Number of work sessions before a long break</p>
          </div>
        </div>
      </Card>

      {/* Automation Settings */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Automation</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
              <p className="text-sm text-muted-foreground">Automatically start break timers after work sessions</p>
            </div>
            <Switch
              id="auto-start-breaks"
              checked={settings.autoStartBreaks}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  autoStartBreaks: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start-pomodoros">Auto-start Pomodoros</Label>
              <p className="text-sm text-muted-foreground">Automatically start work sessions after breaks</p>
            </div>
            <Switch
              id="auto-start-pomodoros"
              checked={settings.autoStartPomodoros}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  autoStartPomodoros: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-mode">Focus Mode</Label>
              <p className="text-sm text-muted-foreground">
                Darken the screen and minimize distractions during work sessions
              </p>
            </div>
            <Switch
              id="focus-mode"
              checked={settings.focusModeEnabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  focusModeEnabled: checked,
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Notifications Settings */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-enabled">Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">Play a sound when timers complete</p>
            </div>
            <Switch
              id="sound-enabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  soundEnabled: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled">Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">Show browser notifications when timers complete</p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notificationsEnabled: checked,
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Data Management</h2>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportData} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Data
            </Button>

            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Import Data
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  aria-label="Import data file"
                />
              </label>
            </Button>
          </div>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="leading-relaxed">
                  This action cannot be undone. This will permanently delete all your todos, pomodoro sessions,
                  statistics, and settings from your browser.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground">
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
