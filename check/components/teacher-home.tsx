"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Users, Clock, AlertCircle, ArrowRight, Star, Lightbulb, Calendar, Zap } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TeacherHome({ user }: { user: any }) {
  // Static Mock Data for Teacher Home
  const topStudents = [
    { name: "Aarav Patel", grade: "Class 10", score: "98%", badge: "Math Wizard", avatar: "/images/avatars/aarav.png", initials: "AP" },
    { name: "Priya Singh", grade: "Class 9", score: "96%", badge: "Physics Pro", avatar: "/images/avatars/priya.png", initials: "PS" },
    { name: "Rohan Kumar", grade: "Class 10", score: "94%", badge: "Consistent", avatar: "/images/avatars/rohan.png", initials: "RK" },
  ]

  const recentAlerts = [
    { id: 1, type: "warning", message: "Attendance dropped in Class 8B today." },
    { id: 2, type: "info", message: "5 new assignments submitted in Science." },
    { id: 3, type: "success", message: "Class 10 Average Score up by 12%." },
  ]

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
        <Navbar />
        
        {/* Hero Section with Video */}
        <div className="relative w-full">
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto block"
                style={{ maxHeight: '80vh', objectFit: 'contain', background: 'black' }} 
            >
                <source src="/images/Video_Ready_After_User_Comment.mp4" type="video/mp4" />
            </video>
            
            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

            {/* Morning Briefing Text (Overlaid on Video) */}
            <div className="absolute bottom-0 left-0 w-full z-20 pb-12 pt-24 bg-gradient-to-t from-black to-transparent">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-2 text-white drop-shadow-lg">
                        Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user?.name || 'Professor'}</span>
                    </h1>
                    <p className="text-slate-200 text-xl drop-shadow-md">Here is your daily classroom intelligence briefing.</p>
                </div>
            </div>
        </div>

        {/* Main Dashboard Content (Below Video) */}
        <div className="container mx-auto px-4 py-8 space-y-12">
            
            {/* Insight Banner */}
            <div className="p-4 bg-indigo-950/40 backdrop-blur-md border border-indigo-500/30 rounded-lg flex items-center gap-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-900/40 shadow-lg">
                <div className="p-2 bg-indigo-500/20 rounded-full shrink-0">
                    <Lightbulb className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-indigo-100">Today's Teaching Insight</h3>
                    <p className="text-slate-300 text-sm">Class 8 attendance dropped by 6% yesterday. Consider a quick check-in.</p>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-300 hover:text-white hover:bg-indigo-500/20 shrink-0">
                    View Details <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>

            {/* Top Performers */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center text-yellow-400">
                        <Trophy className="w-6 h-6 mr-2" /> Top Performing Students
                    </h2>
                    <Button variant="ghost" className="text-slate-400 hover:text-white">View Leaderboard <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topStudents.map((student, i) => (
                        <Card key={i} className="bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-yellow-500/50 hover:bg-slate-900/80 transition-all group relative overflow-hidden shadow-xl">
                            {/* Subtle Rank Number */}
                            <div className="absolute top-2 right-4 text-7xl font-black text-slate-800/50 group-hover:text-yellow-500/10 transition-colors pointer-events-none select-none">
                                #{i+1}
                            </div>
                            
                            <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                                {/* Student Image */}
                                <div className="mb-4 relative">
                                    <div className="absolute inset-0 bg-yellow-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <Avatar className="w-20 h-20 border-2 border-slate-700 group-hover:border-yellow-500 transition-colors">
                                        <AvatarImage src={student.avatar} alt={student.name} />
                                        <AvatarFallback className="bg-slate-800 text-slate-200">{student.initials}</AvatarFallback>
                                    </Avatar>
                                </div>
                                
                                {/* Text Content */}
                                <div className="space-y-1 w-full flex flex-col items-center">
                                    <CardTitle className="text-xl text-white font-bold">{student.name}</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium">{student.grade}</CardDescription>
                                    
                                    <div className="pt-4 flex w-full justify-between items-center border-t border-slate-800/50 mt-4">
                                        <div className="text-left">
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Score</div>
                                            <div className="text-2xl font-bold text-emerald-400">{student.score}</div>
                                        </div>
                                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10 h-8 px-3">
                                            <Star className="w-3 h-3 mr-1 fill-current" /> {student.badge}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 shadow-lg hover:bg-slate-800/50 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                            <Users className="w-4 h-4 mr-2" /> Total Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">1,248</div>
                    </CardContent>
                 </Card>
                 <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 shadow-lg hover:bg-slate-800/50 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                            <Clock className="w-4 h-4 mr-2" /> Attendance (Avg)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">92%</div>
                    </CardContent>
                 </Card>
                 <Card className="bg-slate-900/50 backdrop-blur-md border-l-4 border-l-amber-500 bg-amber-900/10 shadow-lg hover:bg-amber-900/20 transition-colors border-y-slate-800 border-r-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" /> Pending Issues
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">3</div>
                    </CardContent>
                 </Card>
                 {/* Upcoming Mini Card */}
                 <Card className="bg-slate-900/50 backdrop-blur-md border-l-4 border-l-blue-500 shadow-lg border-y-slate-800 border-r-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-400 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" /> Up Next
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-white">Class 9 - Maths</div>
                        <div className="text-xs text-slate-400">10:30 AM • Chapter 4 Quiz</div>
                    </CardContent>
                 </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Alerts */}
                <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-purple-400" /> Recent Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg bg-black/20 border border-slate-800 hover:bg-black/30 transition-colors">
                                <div className={`w-2 h-2 mt-2 rounded-full ${alert.type === 'warning' ? 'bg-red-500 animate-pulse' : alert.type === 'info' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                                <p className="text-sm text-slate-300">{alert.message}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Class of the Day */}
                 <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" /> Class of the Day
                        </CardTitle>
                        <CardDescription className="text-slate-300">Focus Area: Class 10</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="p-3 rounded-lg bg-black/20 border border-slate-800">
                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Observation</div>
                            <p className="text-sm text-slate-300">Participation in History discussion was unusually low.</p>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                             <span className="text-slate-400">Avg Score</span>
                             <span className="font-bold text-emerald-400">88%</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                             <span className="text-slate-400">Pending Assignments</span>
                             <span className="font-bold text-amber-400">12</span>
                         </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-indigo-900/20 backdrop-blur-md border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-purple-400" /> Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full justify-between bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" variant="outline">
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full justify-start text-left bg-purple-600 hover:bg-purple-500 text-white shadow-md">Create New Quiz</Button>
                        </Link>
                        <Button className="w-full justify-start text-left bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">Post Announcement</Button>
                    </CardContent>
                </Card>
            </div>

        </div>
        <Footer />
    </div>
  )
}
