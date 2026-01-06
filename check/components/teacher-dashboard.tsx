"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Users, BookOpen, Calendar, Settings, 
    BarChart3, FileText, CheckCircle2, TrendingUp, Search, AlertTriangle, TrendingDown, Bell, Sparkles
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

import Link from "next/link"
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';

export function TeacherDashboard({ user, standards, subjects }: { user: any, standards: any[], subjects: any[] }) {
  
  // Sort standards: Class 8, Class 9, Class 10
  const sortedStandards = [...standards].sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
      return numA - numB;
  });

  const students = [
      { id: 1, name: "Aarav Patel", class: "Class 10", status: "Active", lastActive: "2 mins ago" },
      { id: 2, name: "Zara Khan", class: "Class 9", status: "Offline", lastActive: "2 days ago" },
      { id: 3, name: "Ishaan Kumar", class: "Class 10", status: "Active", lastActive: "1 hour ago" },
      { id: 4, name: "Neha Singh", class: "Class 8", status: "Active", lastActive: "Just now" },
  ]

  // Mock Data for Analytics
  const data = [
    { name: 'Mon', attendance: 85, performance: 78 },
    { name: 'Tue', attendance: 88, performance: 80 },
    { name: 'Wed', attendance: 92, performance: 85 },
    { name: 'Thu', attendance: 90, performance: 82 },
    { name: 'Fri', attendance: 85, performance: 88 },
    { name: 'Sat', attendance: 75, performance: 90 },
    { name: 'Sun', attendance: 60, performance: 75 },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
        <Navbar />
        
        {/* Hero Section with Full Dashboard Image - Constrained Height, Bottom Aligned */}
        <div className="relative w-full h-[85vh] bg-black">
            {/* The Image Itself - Fits within 85vh, Aligned to Bottom to match Text Overlay */}
            <img 
                src="/images/dashboard.jpeg" 
                alt="Dashboard Background"
                className="w-full h-full object-contain object-bottom block"
            />
            
            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />

            {/* Dashboard Header Overlay */}
            <div className="absolute bottom-0 left-0 w-full z-20 pb-12 pt-32 bg-gradient-to-t from-black to-transparent">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white drop-shadow-xl">
                                Teacher Command Center
                            </h1>
                            <p className="text-slate-200 text-lg drop-shadow-md max-w-2xl">
                                Manage your class performance, track attendance, and issue assignments from your central hub.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            {/* Global Search */}
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input 
                                    placeholder="Search student or class..." 
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-300 backdrop-blur-md focus:bg-white/20 transition-all h-10" 
                                />
                            </div>
                            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md h-10 px-6">
                                <Settings className="w-4 h-4 mr-2" /> Global Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content (Below Hero) */}
        <div className="container mx-auto px-4 py-8 relative z-30">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Classes & Analytics */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Class Management (Academic Atlas) */}
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl hover:border-purple-500/30 transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-purple-400" /> Active Classes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {sortedStandards.map((std) => (
                                <div key={std.id} className="bg-black/20 border border-slate-800 p-4 rounded-lg hover:border-purple-500/50 hover:bg-slate-900/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-200 group-hover:text-purple-400 transition-colors">{std.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {subjects.filter(s => s.standard_id === std.id).map(sub => (
                                                    <Badge key={sub.id} variant="secondary" className="bg-slate-800 text-slate-400 hover:text-white border-slate-700 backdrop-blur-sm">
                                                        {sub.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Link href={`/standards/${std.id}`}>
                                            <Button size="sm" className="bg-purple-600/30 hover:bg-purple-600 text-purple-100 border border-purple-500/30">
                                                View Class <Search className="ml-2 w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm border-t border-slate-800/50 pt-3 mt-2">
                                        <div>
                                            <div className="text-slate-500 text-xs uppercase font-bold">Avg Score</div>
                                            <div className="text-emerald-400 font-bold">78%</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-xs uppercase font-bold">Attendance</div>
                                            <div className="text-blue-400 font-bold">92%</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-xs uppercase font-bold">Pending Tasks</div>
                                            <div className="text-amber-400 font-bold">5</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Analytics Preview */}
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" /> Performance Analytics
                            </CardTitle>
                            <CardDescription>Overall student engagement trends this month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data}>
                                        <defs>
                                            <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#94a3b8" 
                                            fontSize={12} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            stroke="#94a3b8" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}%`}
                                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Bar 
                                            name="Performance Score"
                                            dataKey="performance" 
                                            fill="url(#colorPerformance)" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={20}
                                        />
                                        <Line 
                                            name="Attendance Rate"
                                            type="monotone" 
                                            dataKey="attendance" 
                                            stroke="#10b981" 
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Action-Based Insight */}
                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                <TrendingDown className="w-4 h-4 text-amber-500" />
                                <span>Performance dipped on Sunday due to lower attendance (60%).</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI & Students */}
                <div className="space-y-8">
                     
                     {/* Smart Recommendation ("Wow" Feature) */}
                     <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-purple-500/30 backdrop-blur-md shadow-lg">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> AI Recommendation
                             </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm font-medium text-white mb-3">Consider scheduling a revision quiz for <span className="text-amber-400 font-bold">Class 8</span>. Recent quiz scores indicate a struggle with Algebra.</p>
                             <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all">Schedule Quiz</Button>
                        </CardContent>
                     </Card>

                     {/* Students Needing Attention */}
                     <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 border-l-4 border-l-amber-500 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center text-amber-500">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Needs Attention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "Rohan Gupta", issue: "Attendance (65%)", color: "bg-amber-500/20 text-amber-500" },
                                { name: "Priya Singh", issue: "Incomplete Assignments", color: "bg-amber-500/20 text-amber-500" },
                                { name: "Amit Kumar", issue: "Score dropped by 15%", color: "bg-amber-500/20 text-amber-500" }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-800/50 transition-colors">
                                    <span className="text-slate-300 font-medium">{s.name}</span>
                                    <Badge variant="outline" className={`${s.color} border-0`}>{s.issue}</Badge>
                                </div>
                            ))}
                        </CardContent>
                     </Card>

                     {/* Student Directory */}
                     <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center"><Users className="w-5 h-5 mr-2 text-blue-400" /> Recent Students</span>
                                <Search className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white transition-colors" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {students.map((student) => (
                                <div key={student.id} className="flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            {student.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{student.name}</p>
                                            <p className="text-xs text-slate-500">{student.class}</p>
                                        </div>
                                    </div>
                                    <Badge variant={(student.status === 'Active' ? 'default' : 'secondary') as any} className={student.status === 'Active' ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" : "bg-slate-800 text-slate-500"}>
                                        {student.status}
                                    </Badge>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white mt-2">View All Students</Button>
                        </CardContent>
                     </Card>

                     {/* Tools */}
                     <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-slate-400" /> Administrative Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                             <Button variant="secondary" className="justify-start bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Attendance
                             </Button>
                             <Button variant="secondary" className="justify-start bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                                <Calendar className="w-4 h-4 mr-2" /> Schedule Parent Meeting
                             </Button>
                             <Button variant="secondary" className="justify-start bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                                <FileText className="w-4 h-4 mr-2" /> Generate Report Cards
                             </Button>
                        </CardContent>
                     </Card>
                </div>

            </div>
        </div>
        <Footer />
    </div>
  )
}
