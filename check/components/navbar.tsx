"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Bell, Check, Ban } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/components/auth-provider"
import { useWebSocket } from "@/components/websocket-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { user, isLoggedIn, refreshUser } = useAuth()
  const { notifications, sendMessage, clearNotifications } = useWebSocket()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    refreshUser()
    router.push("/login")
  }

  const handleAcceptRequest = (studentId: string, targetClass: string) => {
      // Send WebSocket message back to student
      sendMessage({
          type: "ACCESS_GRANT",
          studentId: studentId,
          targetClass: targetClass
      })
      toast.success(`Access granted for ${targetClass}`)
      // Optional: Clean up notification locally
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">Margdarshak</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Curriculum
            </Link>
            <Link href="/recommendations" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Mastery Paths
            </Link>
            <Link href="/feedback" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Feedback
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-slate-900 animate-pulse" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800 text-white">
                        <DropdownMenuLabel className="flex justify-between items-center">
                            <span>Notifications</span>
                            {notifications.length > 0 && (
                                <span className="text-xs text-slate-400 cursor-pointer hover:text-white" onClick={clearNotifications}>Clear all</span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <ScrollArea className="h-[300px]">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <div key={idx} className="p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-sm">{notif.message}</p>
                                            {notif.type === "ACCESS_REQUEST" && user?.role === 'teacher' && (
                                                <div className="flex gap-1">
                                                     <Button size="icon" variant="ghost" className="h-6 w-6 text-green-400 hover:bg-green-400/20" onClick={() => handleAcceptRequest(notif.from_id!, notif.target_class!)}>
                                                        <Check className="h-3 w-3" />
                                                     </Button>
                                                     <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:bg-red-400/20">
                                                        <Ban className="h-3 w-3" />
                                                     </Button>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1 block">Just now</span>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                        <User className="mr-2 h-4 w-4" />
                        {user?.name || "Profile"}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white">
                    <DropdownMenuItem asChild className="focus:bg-slate-800 focus:text-white">
                        <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-slate-800 focus:text-white">
                        <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-slate-800">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-white text-black hover:bg-slate-200">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <nav className="md:hidden mt-4 py-4 flex flex-col space-y-4 animate-fade-in bg-slate-900/95 border-t border-slate-800">
            <Link href="/courses" className="text-white/80 hover:text-white transition-colors px-4">
              Curriculum
            </Link>
            <Link href="/recommendations" className="text-white/80 hover:text-white transition-colors px-4">
              Mastery Paths
            </Link>
            <Link href="/feedback" className="text-white/80 hover:text-white transition-colors px-4">
              Feedback
            </Link>

            {isLoggedIn ? (
              <div className="px-4 space-y-2">
                <Link href="/notifications" className="block text-white/80 hover:text-white transition-colors">
                   Notifications ({notifications.length})
                </Link>
                <Link href="/profile" className="block text-white/80 hover:text-white transition-colors">
                  My Profile
                </Link>
                <Link href="/dashboard" className="block text-white/80 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500/20"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-4">
                <Link href="/login">
                  <Button className="w-full bg-white text-black hover:bg-slate-200">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
