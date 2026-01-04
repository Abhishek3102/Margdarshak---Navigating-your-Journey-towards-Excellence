"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Legend,
  ReferenceLine
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, TrendingUp, Clock, RotateCcw, BookOpen, BrainCircuit, Loader2, ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import axiosInstance from "@/lib/axios"

interface QuizReportProps {
  result: {
    score: number
    total: number
    feedback: string
    breakdown: Record<string, { correct: number; total: number }>
    detailed_report?: any[]
    time_analysis?: any[]
    memory_saved?: string
    quiz_grade?: string
  }
  showRetake?: boolean
}

export function QuizReport({ result, showRetake = false }: QuizReportProps) {
  const router = useRouter()

  // Calculate percentage
  const percentage = Math.round((result.score / result.total) * 100)

  // State for Solutions View
  const [loadingSolutions, setLoadingSolutions] = useState(false)
  const [solutions, setSolutions] = useState<any[]>([])
  const [showClassSelector, setShowClassSelector] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  
  const [error, setError] = useState<string | null>(null)

  const handleViewSolutionsClick = () => {
       if (solutions.length > 0 || showClassSelector) {
           // Toggle off
           setSolutions([])
           setShowClassSelector(false)
           setSelectedClass(null)
       } else {
           // Show Selector
           setShowClassSelector(true)
       }
  }

  const fetchSolutionsForClass = async (grade: string) => {
      setLoadingSolutions(true)
      setSelectedClass(grade)
      setError(null)
      try {
          const res = await axiosInstance.get(`/quiz/solutions/${encodeURIComponent(grade)}`)
          if (res.data) {
              setSolutions(res.data)
          }
      } catch (err: any) {
          console.error("Failed to fetch solutions", err)
          setError(err.message || "Failed to load solutions")
      } finally {
          setLoadingSolutions(false)
      }
  }

  // Process Breakdown Data for Chart
  const breakdownData = Object.entries(result.breakdown || {}).map(([subject, stats]) => ({
    subject,
    score: Math.round((stats.correct / stats.total) * 100),
  }))

  const strongest = breakdownData.reduce((prev, current) => (prev.score > current.score ? prev : current), breakdownData[0])
  const weakest = breakdownData.reduce((prev, current) => (prev.score < current.score ? prev : current), breakdownData[0])

  // Process Time Analysis Data
  const reportList = Array.isArray(result.time_analysis) ? result.time_analysis : (result.detailed_report || [])
  
  const timeData = reportList.map((item: any, index: number) => ({
      index: index + 1,
      time: item.time_taken,
      status: item.is_correct ? 'Correct' : 'Wrong',
      subject: item.subject,
      difficulty: item.difficulty,
      fill: item.is_correct ? '#22c55e' : '#ef4444' // Green/Red
  })) || []

  // PDF Download (Client-Side)
  const downloadPDF = async () => {
    const input = document.getElementById('report-content');
    if (input) {
      try {
        const html2canvas = (await import('html2canvas')).default
        const jsPDF = (await import('jspdf')).default
        
        const canvas = await html2canvas(input, { scale: 2 })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        let heightLeft = imgHeight
        let position = 0
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
        
        while (heightLeft >= 0) {
           position = heightLeft - imgHeight
           pdf.addPage()
           pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
           heightLeft -= pdfHeight
        }
        
        pdf.save('Margdarshak_Diagnostic_Report.pdf')
      } catch (err) {
        console.error("PDF Generation failed", err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-white/10">
      
      {/* Top Banner (Optional, sticky info could go here) */}
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <Button variant="ghost" className="pl-0 text-slate-400 hover:text-white mb-2" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Diagnostic Results
                </h1>
                <p className="text-slate-400 mt-1">
                    Personalized performance analysis & AI feedback.
                </p>
            </div>
            <div className="flex gap-3">
                 {showRetake && (
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200" onClick={() => router.push("/quiz")}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Quiz
                    </Button>
                 )}
                 <Button variant="secondary" className="bg-slate-800 text-white hover:bg-slate-700" onClick={downloadPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                 </Button>
            </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Score & Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
                {/* Overall Score Card */}
                <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overall Score</h3>
                                <div className="text-5xl font-bold text-white">{percentage}%</div>
                                <div className="text-slate-500 text-sm mt-1">{result.score} / {result.total} Correct</div>
                            </div>
                            <div className="w-20 h-20">
                                {/* Simple Circular Progress Placeholder */}
                                <svg className="transform -rotate-90 w-full h-full">
                                    <circle cx="40" cy="40" r="36" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                    <circle cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray={`${percentage * 2.26} 226`} />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Insights (Strongest/Weakest) */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Calculation logic for strongest/weakest... */}
                    {(() => {
                        const entries = Object.entries(result.breakdown || {});
                        if (entries.length === 0) return null;
                        const sorted = entries.sort((a, b) => (b[1].correct/b[1].total) - (a[1].correct/a[1].total));
                        const strongest = sorted[0];
                        const weakest = sorted[sorted.length - 1];
                        
                        return (
                            <>
                            <Card className="bg-emerald-950/20 border border-emerald-900/50">
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-emerald-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Strongest Subject
                                        </div>
                                        <div className="text-white font-medium">{strongest[0]}</div>
                                    </div>
                                    <div className="text-emerald-400 font-bold text-xl">
                                        {Math.round((strongest[1].correct/strongest[1].total)*100)}%
                                    </div>
                                </div>
                            </Card>
                            <Card className="bg-amber-950/20 border border-amber-900/50">
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-amber-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Needs Improvement
                                        </div>
                                        <div className="text-white font-medium">{weakest[0]}</div>
                                    </div>
                                    <div className="text-amber-400 font-bold text-xl">
                                        {Math.round((weakest[1].correct/weakest[1].total)*100)}%
                                    </div>
                                </div>
                            </Card>
                            </>
                        )
                    })()}
                </div>

                {/* Subject Mastery Chart */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-widest">Subject Mastery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-2">
                            {breakdownData.map((item) => (
                                <div key={item.subject}>
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>{item.subject}</span>
                                        <span>{item.score}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${item.score > 70 ? 'bg-yellow-400' : item.score > 40 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Solutions CTA */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                    <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-6 h-6 text-blue-400"/>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Detailed Analysis</h3>
                    <p className="text-slate-400 text-xs mb-4">Select a class to view solutions.</p>
                    
                    {!showClassSelector && !solutions.length ? (
                        <Button 
                            onClick={handleViewSolutionsClick} 
                            disabled={loadingSolutions}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                        >
                            View Detailed Solutions
                        </Button>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                             <div className="grid grid-cols-2 gap-2">
                                {["Class 7", "Class 8", "Class 9", "Class 10"].map((cls) => (
                                    <Button
                                        key={cls}
                                        variant={selectedClass === cls ? "default" : "outline"}
                                        className={`text-xs ${selectedClass === cls ? 'bg-blue-600 border-transparent' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                                        onClick={() => fetchSolutionsForClass(cls)}
                                        size="sm"
                                    >
                                        {cls}
                                    </Button>
                                ))}
                             </div>
                             {solutions.length > 0 && (
                                 <Button 
                                     onClick={() => { setSolutions([]); setShowClassSelector(false); setSelectedClass(null); }} 
                                     variant="ghost" 
                                     className="w-full text-slate-500 text-xs hover:text-white"
                                     size="sm"
                                 >
                                     Hide Solutions
                                 </Button>
                             )}
                        </div>
                    )}

                    {loadingSolutions && <div className="mt-3"><Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500"/></div>}

                    {error && (
                        <div className="mt-3 bg-red-950/50 border border-red-500/50 rounded-lg p-2 text-red-200 text-xs text-left">
                            <p className="font-mono break-all">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: AI Analysis & Detailed Charts (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
                {/* AI Review */}
                <Card className="border-none bg-slate-900/50 border border-slate-800/50 shadow-inner overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                         <div className="p-2 bg-purple-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-400" /></div>
                         <h3 className="text-lg font-semibold text-white">AI Tutor Analysis</h3>
                    </div>
                    <CardContent className="p-6">
                         <div className="space-y-4 text-slate-300 leading-relaxed text-sm lg:text-base">
                           {(result.feedback || "AI Analysis unavailable for this result.").split('\n').map((line, i) => {
                               // Markdown Rendering Logic
                               const trimmed = line.trim();
                               if (!trimmed) return null;
                               
                               const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
                               const content = trimmed.replace(/^[\*\-•]\s+/, '');
                               
                               const parts = content.split(/(\*\*.*?\*\*)/g);
                               
                               return (
                                   <div key={i} className={isBullet ? "flex gap-3 ml-2" : "mb-3"}>
                                       {isBullet && <span className="text-purple-400 mt-1.5 min-w-[6px]">•</span>}
                                       <p className={isBullet ? "flex-1" : ""}>
                                           {parts.map((part, j) => {
                                               if (part.startsWith('**') && part.endsWith('**')) {
                                                   return <strong key={j} className="text-purple-200 font-semibold">{part.slice(2, -2)}</strong>
                                               }
                                               return part;
                                           })}
                                       </p>
                                   </div>
                               )
                           })}
                         </div>
                    </CardContent>
                </Card>

                {/* Time & Difficulty Chart */}
                {timeData.length > 0 && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2 border-b border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500"/>
                                <CardTitle className="text-base text-white">Time & Accuracy Timeline</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis type="number" dataKey="index" name="Question" hide />
                                    <YAxis type="number" dataKey="time" name="Time" unit="s" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-950 text-white p-3 rounded shadow-xl border border-slate-800 text-xs">
                                                        <p className="font-bold text-blue-400">Q{data.index}: {data.subject}</p>
                                                        <p className="text-slate-400 mt-1">Time: {data.time}s</p>
                                                        <p className={data.status === 'Correct' ? 'text-emerald-500' : 'text-rose-500'}>{data.status}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {/* <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} label={{ value: "1m", fill: "#f59e0b", fontSize: 10 }} /> */}
                                    <Scatter name="Questions" data={timeData}>
                                        {timeData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Detailed Solutions Section (Full Width) */}
            {solutions.length > 0 && (
                <div className="lg:col-span-12 space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-slate-800 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen className="w-6 h-6 text-blue-400" /></div>
                         <h2 className="text-2xl font-bold text-white">Detailed Solutions & Remedial Concepts</h2>
                         <span className="ml-auto text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded-full">Viewing: {selectedClass}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {solutions.map((q, i) => (
                                <Card key={q.id || i} className="bg-slate-900 border-slate-800">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">Q{i + 1} • {q.subject}</span>
                                        </div>
                                        <p className="text-slate-200 mt-2 font-medium leading-relaxed">{q.question}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Options */}
                                        <div className="grid grid-cols-1 gap-2">
                                            {Object.entries(q.options || {}).map(([key, val]) => (
                                                <div 
                                                    key={key} 
                                                    className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-3 ${
                                                        key === q.correct_option 
                                                            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                                                            : "bg-slate-950 border-slate-800 text-slate-400 opacity-70"
                                                    }`}
                                                >
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        key === q.correct_option ? "bg-emerald-500 text-black" : "bg-slate-800"
                                                    }`}>
                                                        {key}
                                                    </span>
                                                    {String(val)}
                                                    {key === q.correct_option && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto"/>}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Remedial Concept Box */}
                                        {(q.concept || q.formula) && (
                                            <div className="mt-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-sm">
                                                    <BrainCircuit className="w-4 h-4" />
                                                    Concept: {q.concept || "Key Concept"}
                                                </div>
                                                
                                                {q.explanation && (
                                                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                                                        {q.explanation}
                                                    </p>
                                                )}
                                                
                                                {q.formula && q.formula !== "N/A" && (
                                                    <div className="bg-black/40 rounded p-3 font-mono text-xs text-indigo-200 border-l-2 border-indigo-500">
                                                        <span className="text-indigo-500 font-bold block mb-1 text-[10px] uppercase">Formula / Rule</span>
                                                        {q.formula}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
         
         {/* Bottom Actions & Memory */}
         <div className="mt-8 pt-8 border-t border-slate-800">
             <div className="flex justify-center gap-4 mb-8">
                <Button size="lg" onClick={() => router.push("/dashboard")} className="bg-slate-800 hover:bg-slate-700 text-white">
                  Back to Dashboard
                </Button>
                <Button variant="outline" size="lg" onClick={downloadPDF} className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
             </div>

             {result.memory_saved && (
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-indigo-950/20 border border-indigo-500/30">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-indigo-500/20">
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                                <CheckCircle2 className="w-5 h-5" />
                                Memory Updated
                            </div>
                            <span className="text-xs text-indigo-500/60 uppercase tracking-widest font-mono">Permamemory v1.0</span>
                        </div>
                        <CardContent className="p-6">
                            <div className="font-mono text-sm text-indigo-300 leading-relaxed opacity-90">
                                &gt; {result.memory_saved}
                            </div>
                        </CardContent>
                    </Card>
                </div>
             )}
         </div>

       </div>
    </div>
  )
}
