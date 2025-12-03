"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MockModeIndicator() {
  const [isMockMode, setIsMockMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if we're using mock mode
    const usingMockAuth = localStorage.getItem("token") === "mock-jwt-token-for-testing-purposes-only"

    // Check if we're in development environment
    const isDev = process.env.NODE_ENV === "development"

    // Only show in development and when using mock auth
    if (isDev && usingMockAuth) {
      setIsMockMode(true)
      setIsVisible(true)

      // Hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [])

  if (!isMockMode || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md transition-opacity duration-500">
      <Alert variant="default" className="bg-amber-900/90 border-amber-600 text-white">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription className="text-white/80">
          Using mock data for API requests. Login with test@example.com / password123
        </AlertDescription>
      </Alert>
    </div>
  )
}
