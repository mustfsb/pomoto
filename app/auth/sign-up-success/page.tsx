import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Timer } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Pomodoro & Todo</h1>
            </div>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Email Adresinizi Kontrol Edin</CardTitle>
              <CardDescription>Hesabınızı aktifleştirmek için size bir onay emaili gönderdik.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Emailinizdeki linke tıklayarak hesabınızı onaylayın ve giriş yapabilirsiniz.
              </p>
              <Link href="/auth/login" className="block">
                <Button className="w-full">Giriş Sayfasına Dön</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
