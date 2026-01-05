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
        
        <div className="pt-24 pb-12 container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Teacher Command Center</h1>
                    <p className="text-slate-400">Manage your classes, assignments, and students.</p>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Global Search */}
                    <div className="relative w-64">
                         <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                         <Input placeholder="Search student or class..." className="pl-8 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
                    </div>
                    <Button variant="outline" className="text-slate-900 bg-white hover:bg-blue-600">
                        <Settings className="w-4 h-4 mr-2" /> Global Settings
                    </Button>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Classes & Analytics */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Class Management (Academic Atlas) */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-purple-400" /> Active Classes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {sortedStandards.map((std) => (
                                <div key={std.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg hover:border-purple-500/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-200 group-hover:text-purple-400 transition-colors">{std.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {subjects.filter(s => s.standard_id === std.id).map(sub => (
                                                    <Badge key={sub.id} variant="secondary" className="bg-slate-900 text-slate-400 hover:text-white border-slate-700">
                                                        {sub.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Link href={`/standards/${std.id}`}>
                                            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                                                View Class <Search className="ml-2 w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                    
                                    {/* Class Level Quick Stats (Micro-metrics) */}
                                    <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-3 mt-2">
                                        <div>
                                            <div className="text-xs text-slate-500">Avg Score</div>
                                            <div className="text-sm font-bold text-emerald-400">78%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">Attendance</div>
                                            <div className="text-sm font-bold text-blue-400">92%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">Pending Tasks</div>
                                            <div className="text-sm font-bold text-amber-400">5</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Analytics Preview */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" /> Performance Analytics
                            </CardTitle>
                            <CardDescription>Overall student engagement trends this month.</CardDescription>
                        </CardHeader>
                        <CardContent >
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data}>
                                        <defs>
                                            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#94a3b8" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                            label={{ value: 'Day of Week', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
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
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Legend 
                                            verticalAlign="top" 
                                            align="right" 
                                            height={36}
                                            wrapperStyle={{ top: -10, right: 0 }}
                                        />
                                        <Bar dataKey="attendance" name="Attendance Rate" fill="url(#colorAttendance)" radius={[4, 4, 0, 0]} barSize={30} />
                                        <Line type="monotone" dataKey="performance" name="Performance Score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Action-Based Insight */}
                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                <TrendingDown className="w-4 h-4 text-amber-500" />
                                <span>Performance dipped on Sunday due to lower attendance (60%).</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: Students & Actions */}
                <div className="space-y-8">
                     
                     {/* Smart Recommendation ("Wow" Feature) */}
                     <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> AI Recommendation
                             </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-200">Consider scheduling a revision quiz for <span className="font-bold text-white">Class 8</span>. Recent quiz scores indicate a struggle with Algebra.</p>
                            <Button size="sm" variant="secondary" className="mt-3 w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30">Schedule Quiz</Button>
                        </CardContent>
                     </Card>

                     {/* Students Needing Attention */}
                     <Card className="bg-slate-900/50 border-slate-800 border-l-4 border-l-amber-500">
                        <CardHeader>
                            <CardTitle className="flex items-center text-amber-500">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Needs Attention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "Rohan Gupta", issue: "Attendance (65%)" },
                                { name: "Priya Singh", issue: "Incomplete Assignments" },
                                { name: "Amit Kumar", issue: "Score dropped by 15%" }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">{s.name}</span>
                                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20">{s.issue}</Badge>
                                </div>
                            ))}
                        </CardContent>
                     </Card>

                     {/* Student Directory */}
                     <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center"><Users className="w-5 h-5 mr-2 text-blue-400" /> Recent Students</span>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Search className="w-4 h-4" /></Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {students.map((student) => (
                                <div key={student.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                                            {student.name.substring(0,2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{student.name}</p>
                                            <p className="text-xs text-slate-500">{student.class}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={student.status === 'Active' ? 'border-emerald-500/30 text-emerald-500' : 'border-slate-700 text-slate-500'}>
                                        {student.status}
                                    </Badge>
                                </div>
                            ))}
                            <Button variant="link" className="w-full text-slate-400 hover:text-white">View All Students</Button>
                        </CardContent>
                     </Card>

                     {/* Tools */}
                     <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-slate-400" /> Administrative Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                             <Button variant="secondary" className="justify-start bg-slate-800 hover:bg-slate-700 text-slate-200">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Attendance
                             </Button>
                             <Button variant="secondary" className="justify-start bg-slate-800 hover:bg-slate-700 text-slate-200">
                                <Calendar className="w-4 h-4 mr-2" /> Schedule Parent Meeting
                             </Button>
                             <Button variant="secondary" className="justify-start bg-slate-800 hover:bg-slate-700 text-slate-200">
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
