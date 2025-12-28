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
import { AITutorDashboard } from "@/components/ai-tutor-dashboard"

export default function DashboardPage() {
  const { user, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [standards, setStandards] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

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
        let query = supabase.from('standards').select('*').order('name')
        
        // STRICT LOGIC: Only 'teacher' role gets to see everything.
        // Everyone else (student, null, undefined) MUST have a grade to see content.
        if (user?.role !== 'teacher') {
            if (user?.grade) {
                query = query.eq('name', user.grade)
            } else {
                // Return early, don't show any standards. UI will show prompt.
                setIsLoadingData(false)
                return 
            }
        }

        const { data: stdData } = await query
        setStandards(stdData || [])

        // For MVP, just fetching all subjects
        const { data: subData } = await supabase.from('subjects').select('*, standards(name)')
        setSubjects(subData || [])
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoadingData(false)
    }
  }

  const handleUpdateGrade = async (selectedGrade: string) => {
      setIsUpdatingGrade(true)
      try {
          // Update user metadata in Supabase Auth
          const { data, error } = await supabase.auth.updateUser({
              data: { grade: selectedGrade }
          })
          
          if (error) throw error
          
          // Reload properly to ensure auth state is refreshed
          window.location.reload()
      } catch (e) {
          console.error("Failed to update grade", e)
          setIsUpdatingGrade(false)
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

            {/* Missing Grade Prompt: Show for ANYONE who is NOT a teacher and has NO grade */}
            {(user?.role !== 'teacher' && !user?.grade) && (
                <Card className="mt-6 md:mt-0 md:ml-8 border-emerald-500/50 bg-emerald-950/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-400 text-lg flex items-center">
                            <Sparkles className="w-5 h-5 mr-2" /> Complete Your Profile
                        </CardTitle>
                        <CardDescription>Select your current class to unlock your personalized dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        {['Class 8', 'Class 9', 'Class 10'].map((cls) => (
                            <Button 
                                key={cls} 
                                size="sm" 
                                disabled={isUpdatingGrade}
                                onClick={() => handleUpdateGrade(cls)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {isUpdatingGrade ? <Loader2 className="w-3 h-3 animate-spin" /> : cls}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Stats: Show only if Teacher OR (Standard user with grade) */}
            {(user?.role === 'teacher' || user?.grade) && (
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Current Streak</p>
                        <p className="text-xl font-bold text-emerald-400 flex items-center justify-end">
                            <TrendingUp className="w-4 h-4 mr-1" /> 5 Days
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Content Section: Show only if Teacher OR (Standard user with grade) */}
        {(user?.role === 'teacher' || user?.grade) ? (
            <div className="flex flex-col space-y-8">
                {/* Dashboard Sub-Navigation */}
                <div className="flex items-center space-x-1 border-b border-slate-800 pb-1 overflow-x-auto">
                    {['Overview', 'My Progress', 'Assignments', 'AI Tutor'].map((tab) => (
                        <Button 
                            key={tab}
                            variant="ghost" 
                            onClick={() => setActiveTab(tab)}
                            className={`relative ${activeTab === tab ? "text-white hover:text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'Overview' && (
                    <>
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
                    </>
                )}

                {activeTab === 'AI Tutor' && (
                    <AITutorDashboard userName={user?.name || 'Scholar'} />
                )}
                
                {(activeTab === 'My Progress' || activeTab === 'Assignments') && (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
                        <p className="text-slate-500">This module is coming soon.</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
                <p className="text-slate-500">Select your class above to initialize your dashboard.</p>
            </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
