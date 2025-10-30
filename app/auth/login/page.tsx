"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Timer, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting login process...")
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      console.log("[v0] Login successful, showing toast...")
      toast({
        title: "Login successful!",
        description: "Redirecting to dashboard...",
        variant: "success",
      })

      console.log("[v0] Waiting before redirect...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("[v0] Redirecting to dashboard...")
      window.location.href = "/dashboard"
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      console.error("[v0] Login error:", errorMessage)
      setError(errorMessage)
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6 lg:p-10 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="h-8 w-8" />
              <h1 className="text-headline-small">Pomodoro & Todo</h1>
            </div>
            <p className="text-body-medium text-muted-foreground">Boost your productivity</p>
          </div>
          <Card className="border-0 shadow-lg rounded-3xl bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-title-large">Login</CardTitle>
              <CardDescription className="text-body-medium">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-label-large">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 shadow-sm bg-muted/50 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-label-large">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 shadow-sm bg-muted/50 rounded-xl"
                    />
                  </div>
                  {error && <p className="text-body-small text-destructive">{error}</p>}
                  <Button type="submit" className="w-full shadow-md rounded-xl" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-body-small">
                  Don't have an account?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4 text-primary font-medium">
                    Sign Up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
