"use client"

import { useEffect, useState } from "react"

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-yellow-500",
  "bg-cyan-500",
]

export function Logo() {
  const [bgColor, setBgColor] = useState("")

  useEffect(() => {
    // Set random color on mount
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setBgColor(randomColor)
  }, [])

  if (!bgColor) return null

  return (
    <>
      {/* Mobile: Show "Pt" with 10px border radius */}
      <div className={`md:hidden ${bgColor} bg-opacity-80 rounded-[10px] px-3 py-1.5 text-white font-bold text-lg`}>
        Pt
      </div>
      {/* Desktop: Show "Pomotodo" */}
      <div className={`hidden md:block ${bgColor} bg-opacity-80 rounded-[20px] px-4 py-2 text-white font-bold text-xl`}>
        Pomotodo
      </div>
    </>
  )
}
