"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name?: string
  email?: string
  role?: string
  grade?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = async () => {
    // Manually fetch session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
        setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            name: session.user.user_metadata?.full_name,
            grade: session.user.user_metadata?.grade
        })
        setIsLoggedIn(true)
    } else {
        setUser(null)
        setIsLoggedIn(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    refreshUser()

    // Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth State Change:", event)
      if (session?.user) {
        setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            name: session.user.user_metadata?.full_name,
            grade: session.user.user_metadata?.grade
        })
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Redirect Logic
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      const protectedRoutes = ["/dashboard", "/profile"]
      // Check if current path starts with any protected route
      if (protectedRoutes.some((route) => pathname?.startsWith(route))) {
         // Avoid infinite loop if already on login
         if (pathname !== "/login") {
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`)
         }
      }
    }
  }, [isLoggedIn, loading, pathname, router])

  return <AuthContext.Provider value={{ user, isLoggedIn, loading, refreshUser }}>{children}</AuthContext.Provider>
}
