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
import { CheckCircle2, AlertTriangle, TrendingUp, Clock, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizReportProps {
  result: {
    score: number
    total: number
    feedback: string
    breakdown: Record<string, { correct: number; total: number }>
    detailed_report?: any[]
    time_analysis?: any[]
    memory_saved?: string
  }
  showRetake?: boolean
}

export function QuizReport({ result, showRetake = false }: QuizReportProps) {
  const router = useRouter()

  // Calculate percentage
  const percentage = Math.round((result.score / result.total) * 100)

  // Process Breakdown Data for Chart
  const chartData = Object.entries(result.breakdown).map(([subject, stats]) => ({
    subject,
    score: Math.round((stats.correct / stats.total) * 100),
  }))

  const strongest = chartData.reduce((prev, current) => (prev.score > current.score ? prev : current), chartData[0])
  const weakest = chartData.reduce((prev, current) => (prev.score < current.score ? prev : current), chartData[0])

  // Process Time Analysis Data
  // Ensure we use the detailed array if available (stored in time_analysis for backward compact)
  // Currently backend returns detailed_report list either in 'detailed_report' key or 'time_analysis' key
  const reportList = Array.isArray(result.time_analysis) ? result.time_analysis : (result.detailed_report || [])
  
  const timeData = reportList.map((item: any, index: number) => ({
      index: index + 1,
      time: item.time_taken,
      status: item.is_correct ? 'Correct' : 'Wrong',
      subject: item.subject,
      difficulty: item.difficulty,
      fill: item.is_correct ? '#22c55e' : '#ef4444' // Green/Red
  })) || []

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
    <div className="container mx-auto py-8 px-4 max-w-[95vw] lg:max-w-7xl">
       <div id="report-content" className="bg-slate-950 p-6 md:p-8 rounded-xl border border-slate-800 shadow-2xl"> 
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
           <div>
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
               Diagnostic Results
             </h1>
             <p className="text-muted-foreground mt-1">Personalized performance analysis & AI feedback.</p>
           </div>
           
           <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/quiz')}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            {showRetake && (
                <Button onClick={() => router.push('/quiz/test')} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                </Button>
            )}
           </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Stats & Breakdown (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
                {/* Compact Score Card */}
                <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                             <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Overall Score</p>
                             <div className="text-5xl font-bold text-white tracking-tight">{percentage}%</div>
                             <p className="text-xs text-slate-500 mt-1">{result.score} / {result.total} Correct</p>
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                             <svg className="w-full h-full transform -rotate-90">
                                 <circle cx="36" cy="36" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                                 <circle cx="36" cy="36" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-blue-500" 
                                         strokeDasharray={`${2 * Math.PI * 32}`} 
                                         strokeDashoffset={`${2 * Math.PI * 32 * (1 - percentage / 100)}`} 
                                 />
                             </svg>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Insights Stats */}
                <div className="grid grid-cols-1 gap-3">
                    {strongest && (
                      <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-emerald-500 font-medium uppercase">Strongest Subject</p>
                                <p className="text-white font-semibold">{strongest.subject}</p>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-emerald-400">{strongest.score}%</span>
                      </div>
                    )}
                    {weakest && weakest.score < 100 && (
                      <div className="flex items-center justify-between bg-amber-950/20 border border-amber-500/20 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-full text-amber-500"><AlertTriangle className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-amber-500 font-medium uppercase">Needs Improvement</p>
                                <p className="text-white font-semibold">{weakest.subject}</p>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-amber-400">{weakest.score}%</span>
                      </div>
                    )}
                </div>

                {/* Breakdown Histogram */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">Subject Mastery</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score > 75 ? "#10b981" : entry.score > 40 ? "#eab308" : "#ef4444"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
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
                           {result.feedback.split('\n').map((line, i) => {
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
                                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} label={{ value: "1m", fill: "#f59e0b", fontSize: 10 }} />
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
