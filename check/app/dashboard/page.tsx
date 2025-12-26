"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BookOpen, Award, TrendingUp, Sparkles, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { GenerativeChat } from "@/components/generative-chat"

export default function DashboardPage() {
  const { user, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [standards, setStandards] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, loading, router])

  // Fetch Data
  useEffect(() => {
    if (user) {
        fetchContent()
    }
  }, [user])

  const fetchContent = async () => {
    try {
        // 1. Fetch Standards (Classes)
        let query = supabase.from('standards').select('*').order('name')
        
        if (user?.role === 'student' && user?.grade) {
            query = query.eq('name', user.grade)
        }

        const { data: stdData } = await query
        setStandards(stdData || [])

        // 2. Fetch Subjects for the first standard (default View)
        // For MVP, just fetching all subjects
        const { data: subData } = await supabase.from('subjects').select('*, standards(name)')
        setSubjects(subData || [])
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoadingData(false)
    }
  }

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Navbar />

      <div className="pt-24 pb-12 px-4 container mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
                <h1 className="text-4xl font-bold mb-2">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">{user?.name || 'Scholar'}</span>
                </h1>
                <p className="text-slate-400">Your AI-powered learning path is ready.</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Current Streak</p>
                    <p className="text-xl font-bold text-emerald-400 flex items-center justify-end">
                        <TrendingUp className="w-4 h-4 mr-1" /> 5 Days
                    </p>
                </div>
            </div>
        </div>

        <div className="flex flex-col space-y-8">
            {/* Dashboard Sub-Navigation */}
            <div className="flex items-center space-x-1 border-b border-slate-800 pb-1">
                <Button variant="ghost" className="text-white hover:bg-slate-800/50 hover:text-purple-400 relative">
                    Overview
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></span>
                </Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">My Progress</Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">Assignments</Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">Practice</Button>
            </div>

            {/* Active Course Card */}
            <Card className="bg-slate-900/50 border-purple-500/20 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader>
                    <CardTitle className="flex items-center text-white">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-400" /> 
                        Recommended For You
                    </CardTitle>
                    <CardDescription>Based on your recent performance in "Calculus"</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div>
                            <h3 className="font-semibold text-lg text-white">Limits & Derivatives</h3>
                            <p className="text-sm text-slate-400">Class 11 • Mathematics</p>
                        </div>
                        <Button className="bg-white text-black hover:bg-slate-200">
                            <Play className="w-4 h-4 mr-2" /> Resume
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Standards & Subjects */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-slate-400" /> 
                    Academic Atlas
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                    {standards.map((std) => (
                        <div key={std.id} className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-all cursor-pointer rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-slate-200 mb-4">{std.name}</h3>
                            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8">
                                {subjects.filter(s => s.standard_id === std.id).map(sub => (
                                    <div key={sub.id} className="text-sm text-slate-400 flex items-center p-2 hover:bg-slate-800/50 rounded-md transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                        {sub.name}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
                                <Link href={`/standards/${std.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 h-10 px-4 py-2">
                                    View Detailed Curriculum <BookOpen className="ml-2 w-4 h-4"/>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
