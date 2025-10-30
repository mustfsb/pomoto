"use client"

import { useEffect, useState } from "react"

interface FocusModeOverlayProps {
  isActive: boolean
}

export function FocusModeOverlay({ isActive }: FocusModeOverlayProps) {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    if (isActive) {
      document.body.setAttribute("data-focus-mode", "true")

      // Show "Focus" text when focus mode activates
      setShowText(true)
      // Hide the text after 3 seconds
      const timer = setTimeout(() => {
        setShowText(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      document.body.removeAttribute("data-focus-mode")
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <>
      {/* Darkened overlay - increased opacity for stronger effect */}
      <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md transition-all duration-1000 ease-in-out" />

      {/* Focus text animation */}
      {showText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-focus-text">
            <h1 className="text-8xl font-bold text-white drop-shadow-2xl">Focus</h1>
          </div>
        </div>
      )}
    </>
  )
}
