"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Eye, Calendar, Clock, Loader2 } from "lucide-react"
import axiosInstance from "@/lib/axios"

interface QuizSubmission {
  id: string
  created_at: string
  score: number
  total_questions: number
  student_name?: string
  student_grade?: string
  ai_review: string
}

export default function GradeQuizView() {
  const params = useParams()
  const router = useRouter()
  const grade = params.grade as string // "8", "9", "10"
  
  const [students, setStudents] = useState<QuizSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/quiz/teacher/${grade}/students`)
        setStudents(res.data)
      } catch (error) {
        console.error("Failed to fetch students", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [grade])

  const filteredStudents = students.filter(s => 
     (s.student_name || "Unknown").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.push("/quiz/teacher")}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                 <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                    Class {grade} Analytics
                 </h1>
                 <p className="text-slate-400">Reviewing performance for {students.length} students</p>
            </div>
        </div>

        <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                    placeholder="Search pupil name..." 
                    className="pl-9 bg-slate-900 border-slate-700 text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center p-20"><Loader2 className="animate-spin text-purple-500 w-8 h-8"/></div>
        ) : filteredStudents.length === 0 ? (
            <div className="text-center p-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                <p className="text-slate-500">No submissions found for Class {grade}.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                     ${(student.score / student.total_questions) > 0.7 ? 'bg-green-500/20 text-green-400' : 
                                       (student.score / student.total_questions) > 0.4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                     {Math.round((student.score / student.total_questions) * 100)}%
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-white">{student.student_name || "Anonymous Student"}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(student.created_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(student.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                 <div className="text-right hidden md:block">
                                     <p className="text-sm font-medium text-slate-300">Score</p>
                                     <p className="text-xl font-bold text-white">{student.score} / {student.total_questions}</p>
                                 </div>
                                 <Button 
                                    className="bg-purple-600 hover:bg-purple-500"
                                    onClick={() => router.push(`/quiz/teacher/result/${student.id}`)}
                                 >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Report
                                 </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}
