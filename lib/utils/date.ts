import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { tr } from "date-fns/locale"

export const formatDate = (date: Date | number, formatStr = "PPP") => {
  return format(date, formatStr, { locale: tr })
}

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export const getDateRange = (range: "today" | "week" | "month" | "custom", customStart?: Date, customEnd?: Date) => {
  const now = new Date()

  switch (range) {
    case "today":
      return { start: now, end: now }
    case "week":
      return { start: startOfWeek(now, { locale: tr }), end: endOfWeek(now, { locale: tr }) }
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "custom":
      return { start: customStart || now, end: customEnd || now }
    default:
      return { start: now, end: now }
  }
}

export const generateHeatmapData = (sessions: Array<{ date: string }>) => {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const days = eachDayOfInterval({ start: startDate, end: now })

  const sessionCounts = sessions.reduce(
    (acc, session) => {
      acc[session.date] = (acc[session.date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    return {
      date: dateStr,
      count: sessionCounts[dateStr] || 0,
      isToday: isToday(day),
    }
  })
}
