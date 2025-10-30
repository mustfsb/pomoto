export const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission()
  }
}

export const showNotification = (title: string, body: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    })
  }
}

export const playSound = (soundEnabled: boolean) => {
  if (soundEnabled && typeof window !== "undefined") {
    const audio = new Audio("/notification.mp3")
    audio.play().catch(() => {
      // Ignore errors if sound can't play
    })
  }
}
