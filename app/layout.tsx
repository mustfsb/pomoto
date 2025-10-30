import type React from "react"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Pomodoro & Todo App",
  description: "Modern productivity app with Pomodoro timer and todo management",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <Navigation />
        <main className="pb-20 pt-20 md:pt-24 md:pb-4 min-h-screen">{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
