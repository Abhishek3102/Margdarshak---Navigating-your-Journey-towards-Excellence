"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { user, isLoggedIn, refreshUser } = useAuth()
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">AMEP</span>
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
