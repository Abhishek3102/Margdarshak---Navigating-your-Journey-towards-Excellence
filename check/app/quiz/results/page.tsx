
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, CartesianGrid, Legend, ReferenceLine } from "recharts"
import { CheckCircle2, RotateCcw, TrendingUp, AlertTriangle, Clock } from "lucide-react"

interface DetailedReportItem {
    id: string
    subject: string
    difficulty: string
    time_taken: number
    is_correct: boolean
}

interface QuizResult {
  score: number
  total: number
  feedback: string
  breakdown: Record<string, { correct: number; total: number }>
  detailed_report?: DetailedReportItem[]
}

export default function QuizResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    // In a real app, we might fetch this by ID, but for now we read from local ephemeral storage
    // or we could have passed it via state. LocalStorage is strictly for this immediate post-quiz view.
    const stored = localStorage.getItem("latestQuizResult")
    if (stored) {
      setResult(JSON.parse(stored))
    } else {
      router.push("/quiz")
    }
  }, [router])

  if (!result) return null

  // Process data for Chart
  const chartData = Object.entries(result.breakdown).map(([subject, stats]) => ({
    subject: subject.split(" ")[0], // Shorten name
    score: (stats.correct / stats.total) * 100,
    fullSubject: subject
  }))

  const percentage = Math.round((result.score / result.total) * 100)
  
  // Determine Strong/Weak
  const sorted = [...chartData].sort((a, b) => b.score - a.score)
  const strongest = sorted[0]
  const weakest = sorted[sorted.length - 1]

  // Time Analysis Data (if available)
  const timeData = result.detailed_report?.map((item, index) => ({
      index: index + 1,
      time: Math.round(item.time_taken),
      subject: item.subject,
      difficulty: item.difficulty,
      status: item.is_correct ? 'Correct' : 'Incorrect',
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
        
        // If content is longer than one page, we might need multiple pages or just scale
        // For simplicity, we are doing a fit-to-width single image now, but splitting is better for long reports.
        // Let's stick to single page fit if possible, or add pages.
        
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
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div id="report-content" className="bg-slate-950 p-6 rounded-xl"> 
      {/* Wrapped in ID for PDF generation */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2">Diagnostic Results</h1>
            <p className="text-muted-foreground">Here is your personalized performance analysis.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Score Card */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle>Overall Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="text-6xl font-black text-primary mb-2">
                  {percentage}%
                </div>
                <p className="text-lg text-muted-foreground">
                  {result.score} out of {result.total} Questions Correct
                </p>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="border-none shadow-xl border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-lg leading-relaxed italic text-muted-foreground">
                   "{result.feedback}"
                 </p>
                 <div className="mt-6 flex flex-col gap-3">
                    {strongest && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-md">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Strongest Area:</span>
                        {strongest.fullSubject} ({Math.round(strongest.score)}%)
                      </div>
                    )}
                    {weakest && weakest.score < 100 && (
                      <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-md">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Focus Needed:</span>
                        {weakest.fullSubject} ({Math.round(weakest.score)}%)
                      </div>
                    )}
                 </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="col-span-1 md:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle>Subject Mastery Breakdown</CardTitle>
                <CardDescription>Percentage accuracy per subject</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="subject" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff", borderRadius: "8px" }}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 75 ? "#22c55e" : entry.score > 40 ? "#eab308" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Improved Time Analysis Chart */}
            {timeData.length > 0 && (
                <Card className="col-span-1 md:col-span-2 shadow-lg border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-500"/>
                            <div>
                                <CardTitle>Time & Difficulty Analysis</CardTitle>
                                <CardDescription>Time taken per question (Green = Correct, Red = Wrong)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis 
                                    type="number" 
                                    dataKey="index" 
                                    name="Question" 
                                    label={{ value: 'Question Number', position: 'insideBottom', offset: -10 }} 
                                    domain={[1, 'auto']}
                                />
                                <YAxis 
                                    type="number" 
                                    dataKey="time" 
                                    name="Time" 
                                    unit="s" 
                                    label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} 
                                />
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700">
                                                    <p className="font-bold mb-1">Q{data.index}: {data.subject}</p>
                                                    <p className="text-sm text-slate-300">Difficulty: <span className="text-white">{data.difficulty}</span></p>
                                                    <p className="text-sm text-slate-300">Time: <span className="text-white">{data.time} seconds</span></p>
                                                    <p className={`text-sm font-semibold mt-1 ${data.status === 'Correct' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {data.status}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <ReferenceLine y={60} label="1 Min" stroke="orange" strokeDasharray="3 3" />
                                <Scatter name="Questions" data={timeData} shape="circle">
                                    {timeData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} r={6} /> // Larger dots
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
          </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <Button size="lg" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
        <Button variant="outline" size="lg" onClick={downloadPDF}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>
    </div>
  )
}
