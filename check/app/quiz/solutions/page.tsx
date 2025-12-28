"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button" 
import { CheckCircle2, BookOpen, BrainCircuit, Loader2, ArrowLeft } from "lucide-react"
import axiosInstance from "@/lib/axios"

export default function SolutionsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const [loading, setLoading] = useState(true)
    const [solutions, setSolutions] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [grade, setGrade] = useState<string>("")

    useEffect(() => {
        const fetchSolutions = async () => {
            setLoading(true)
            try {
                // 1. Determine Grade
                let targetGrade = searchParams.get("grade")
                
                if (!targetGrade) {
                     // Fallback to fetching user profile
                     try {
                        const userRes = await axiosInstance.get('/auth/me')
                        targetGrade = userRes.data?.grade || "Class 10"
                     } catch (e) {
                         console.error("Auth check failed", e)
                         targetGrade = "Class 10"
                     }
                }

                setGrade(targetGrade || "")

                // 2. Fetch Solutions
                // Ensure encodeURIComponent handles spaces in "Class 10"
                const res = await axiosInstance.get(`/quiz/solutions/${encodeURIComponent(targetGrade || "Class 10")}`)
                if (res.data) {
                    setSolutions(res.data)
                }
            } catch (err: any) {
                console.error("Failed to load solutions", err)
                setError(err.message || "Failed to load solutions")
            } finally {
                setLoading(false)
            }
        }

        fetchSolutions()
    }, [searchParams])

    return (
        <div className="min-h-screen bg-black font-sans selection:bg-white/10">
            <Navbar />
            
            <div className="container mx-auto py-8 px-4 max-w-5xl mt-20">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                             <BookOpen className="w-6 h-6 text-blue-500" />
                             Detailed Solutions
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Remedial concepts and explanations for {grade}
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                     <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-lg text-red-400 text-center">
                         <p>Error loading solutions: {error}</p>
                         <Button variant="outline" className="mt-4 border-red-500/50 text-red-400" onClick={() => window.location.reload()}>Retry</Button>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 pb-20">
                        {solutions.map((q, i) => (
                             <Card key={q.id || i} className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-3 border-b border-slate-800/50">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">Q{i + 1} • {q.subject}</span>
                                    </div>
                                    <p className="text-slate-200 mt-3 font-medium leading-relaxed text-lg">{q.question}</p>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Options */}
                                    <div className="grid grid-cols-1 gap-2">
                                        {Object.entries(q.options || {}).map(([key, val]) => (
                                            <div 
                                                key={key} 
                                                className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-3 transition-colors ${
                                                    key === q.correct_option 
                                                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                                                        : "bg-slate-950 border-slate-800 text-slate-400 opacity-60"
                                                }`}
                                            >
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                    key === q.correct_option ? "bg-emerald-500 text-black" : "bg-slate-800"
                                                }`}>
                                                    {key}
                                                </span>
                                                <span className="flex-1">{String(val)}</span>
                                                {key === q.correct_option && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0"/>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Remedial Concept Box */}
                                    {(q.concept || q.formula) && (
                                        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl overflow-hidden">
                                            <div className="bg-indigo-500/10 px-4 py-3 border-b border-indigo-500/10 flex items-center gap-2">
                                                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                                                <span className="text-sm font-semibold text-indigo-300">Remedial Concept</span>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <h4 className="text-indigo-200 font-semibold mb-2 text-sm">{q.concept}</h4>
                                                    {q.explanation && (
                                                        <p className="text-slate-400 text-sm leading-relaxed">
                                                            {q.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {q.formula && q.formula !== "N/A" && (
                                                    <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-indigo-200 border-l-4 border-indigo-500">
                                                        <span className="text-indigo-500 font-bold block mb-2 text-[10px] uppercase tracking-wider">Key Formula</span>
                                                        {q.formula}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
