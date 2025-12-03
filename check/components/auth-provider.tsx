"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getCurrentUser, isAuthenticated } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"

// Flag to track if we're using mock authentication
const USING_MOCK_AUTH =
  typeof window !== "undefined" && localStorage.getItem("token") === "mock-jwt-token-for-testing-purposes-only"

interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  refreshUser: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()

  // Add a notification for mock auth in development mode
  useEffect(() => {
    if (USING_MOCK_AUTH && process.env.NODE_ENV === "development") {
      console.info("Using mock authentication for development")
    }
  }, [])

  const checkAuth = () => {
    const authenticated = isAuthenticated()
    setIsLoggedIn(authenticated)

    if (authenticated) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    } else {
      setUser(null)
    }

    setLoading(false)
  }

  const refreshUser = () => {
    checkAuth()
  }

  useEffect(() => {
    checkAuth()

    // Listen for storage events (for multi-tab logout)
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [])

  // Redirect to login if token is removed/expired and on a protected route
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      const protectedRoutes = ["/profile", "/dashboard"]
      if (protectedRoutes.some((route) => pathname?.startsWith(route))) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`)
      }
    }
  }, [isLoggedIn, loading, pathname, router])

  return <AuthContext.Provider value={{ user, isLoggedIn, loading, refreshUser }}>{children}</AuthContext.Provider>
}
