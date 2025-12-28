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
  allowed_classes?: string[]
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  refreshUser: (retryForClass?: string) => Promise<void>
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

  // Function to manually refresh user data (e.g. after access grant)
  // retryForClass: If provided, will keep refreshing until this class appears in metadata (handles server replication lag)
  const refreshUser = async (retryForClass?: string) => {
    let attempts = 0
    const maxAttempts = retryForClass ? 5 : 1
    
    while (attempts < maxAttempts) {
        try {
            // Force a session refresh to get new JWT with updated metadata
            const { data: { session }, error } = await supabase.auth.refreshSession()
            
            if (error) {
                console.warn("Session refresh warning:", error.message)
                // Fallback to getUser if refresh fails
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                if (userError || !user) throw userError
                
                // Check if we got what we wanted
                const classes = user.user_metadata?.allowed_classes || []
                if (retryForClass && !classes.includes(retryForClass)) {
                    // Stale data, retry
                    console.log(`[Auth] Stale data (missing ${retryForClass}), retrying... ${attempts + 1}/${maxAttempts}`)
                    attempts++
                    await new Promise(r => setTimeout(r, 1000)) // Wait 1s
                    continue
                }

                setUser({
                    id: user.id,
                    email: user.email,
                    role: user.user_metadata?.role || 'student',
                    name: user.user_metadata?.full_name,
                    grade: user.user_metadata?.grade,
                    allowed_classes: classes
                })
                setIsLoggedIn(true)
                setLoading(false)
                if (retryForClass) console.log(`[Auth] Sync success! Found ${retryForClass}`)
                return
            }

            if (session?.user) {
                const classes = session.user.user_metadata?.allowed_classes || []
                if (retryForClass && !classes.includes(retryForClass)) {
                    console.log(`[Auth] Stale session (missing ${retryForClass}), retrying... ${attempts + 1}/${maxAttempts}`)
                    attempts++
                    await new Promise(r => setTimeout(r, 1000))
                    continue
                }

                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: session.user.user_metadata?.role || 'student',
                    name: session.user.user_metadata?.full_name,
                    grade: session.user.user_metadata?.grade,
                    allowed_classes: classes
                })
                setIsLoggedIn(true)
                if (retryForClass) console.log(`[Auth] Sync success! Found ${retryForClass}`)
                return
            } else {
                setUser(null)
                setIsLoggedIn(false)
                return
            }
        } catch (e: any) {
            // Check for "Auth session missing" error
            const isSessionMissing = 
                e?.message?.includes("Auth session missing") || 
                e?.name === "AuthSessionMissingError" ||
                (e?.error?.message?.includes("Auth session missing"));

            if (isSessionMissing) {
                // Determine we are logged out, no need to retry or log error
                setUser(null)
                setIsLoggedIn(false)
                return // Exit loop
            }
            
            console.error("Session fetch failed:", e)
        }
        attempts++
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
        // Update state from session event
         setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            name: session.user.user_metadata?.full_name,
            grade: session.user.user_metadata?.grade,
            allowed_classes: session.user.user_metadata?.allowed_classes || []
        })
        setIsLoggedIn(true)
      } else if (event === 'SIGNED_OUT') {
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
