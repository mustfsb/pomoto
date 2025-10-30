"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Timer, CheckSquare, BarChart3, Settings, LogIn, UserPlus, Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"
import { Logo } from "@/components/logo"

const authenticatedNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/todos", label: "Todo", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const { settings, updateSettings } = useAppStore()

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(settings.theme)
    }
  }, [settings.theme, mounted])

  if (!mounted) return null

  if (pathname?.startsWith("/auth/")) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-container-low elevation-2 border-b border-outline-variant transition-all duration-1000 focus-mode-nav">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16 gap-2 md:gap-4">
          {/* Logo on the left with flex-shrink-0 to prevent squishing */}
          <div className="flex-shrink-0 min-w-fit">
            <Logo />
          </div>

          {/* Center navigation with flex-1 to take available space */}
          <div className="flex-1 flex items-center justify-center min-w-0 overflow-x-auto">
            {user ? (
              // Authenticated navigation
              <div className="flex items-center gap-1 md:gap-2 focus-mode-buttons">
                {authenticatedNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 px-2 md:px-4 py-2 rounded-full transition-all text-xs md:text-base whitespace-nowrap",
                        "hover:bg-secondary-container/50 text-on-surface-variant",
                        isActive && "text-on-secondary-container bg-secondary-container font-medium",
                      )}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              // Unauthenticated navigation - only login and signup
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Theme toggle on the right with flex-shrink-0 */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-container-high elevation-2">
                <DropdownMenuItem onClick={() => updateSettings({ theme: "light" })}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSettings({ theme: "dark" })}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateSettings({ theme: "system" })}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
