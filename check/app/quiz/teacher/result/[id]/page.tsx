"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { QuizReport } from "@/components/quiz-report"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import axiosInstance from "@/lib/axios"

interface QuizResult {
  score: number
  total: number // mapped from total_questions
  total_questions?: number // API returns this
  feedback: string // mapped from ai_review
  ai_review?: string // API returns this
  breakdown: Record<string, { correct: number; total: number }> // mapped from subject_scores
  subject_scores?: Record<string, { correct: number; total: number }> // API returns this
  detailed_report?: any[]
  time_analysis?: any[]
}

export default function TeacherResultView() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/quiz/teacher/result/${id}`)
        
        // Map backend fields to frontend component props if needed
        const data = res.data
        const mappedResult = {
            ...data,
            total: data.total_questions,
            feedback: data.ai_review,
            breakdown: data.subject_scores
        }
        setResult(mappedResult)
      } catch (err) {
        console.error("Failed to fetch result", err)
        setError("Could not load report.")
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
         <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error || !result) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
              <p className="text-red-400">{error || "Result not found"}</p>
              <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2"/>
                  Go Back
              </Button>
          </div>
      )
  }

  return (
      <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 py-8">
              <Button variant="ghost" className="text-slate-400 hover:text-white mb-4" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2"/>
                  Back to Class List
              </Button>
              <QuizReport result={result} showRetake={false} />
          </div>
      </div>
  )
}
