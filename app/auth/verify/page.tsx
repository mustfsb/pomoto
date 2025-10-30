"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Timer, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function VerifyContent() {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (!email) {
      router.push("/auth/sign-up")
    }
  }, [email, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      })

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "Email adresiniz doğrulandı. Giriş yapılıyor...",
      })

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Doğrulama kodu geçersiz")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    const supabase = createClient()
    setIsResending(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      toast({
        title: "Kod gönderildi",
        description: "Yeni doğrulama kodu email adresinize gönderildi.",
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Kod gönderilemedi")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Pomodoro & Todo</h1>
            </div>
            <p className="text-sm text-muted-foreground">Email adresinizi doğrulayın</p>
          </div>
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Doğrulama Kodu</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {email} adresine gönderilen 6 haneli kodu girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Doğrulama Kodu</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-2xl tracking-widest border-0 shadow-sm bg-muted/50"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full shadow-md" disabled={isLoading || code.length !== 6}>
                    {isLoading ? "Doğrulanıyor..." : "Doğrula"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-0 shadow-sm bg-muted/30"
                    onClick={handleResendCode}
                    disabled={isResending}
                  >
                    {isResending ? "Gönderiliyor..." : "Kodu Tekrar Gönder"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
