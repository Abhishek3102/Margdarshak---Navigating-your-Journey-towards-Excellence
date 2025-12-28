"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QuizReport } from "@/components/quiz-report"
import { Loader2 } from "lucide-react"

interface QuizResult {
  score: number
  total: number
  feedback: string
  breakdown: Record<string, { correct: number; total: number }>
  detailed_report?: any[]
  time_analysis?: any[]
  memory_saved?: string
  quiz_grade?: string
}

import axiosInstance from "@/lib/axios"

export default function QuizResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
        // always fetch from server
        try {
            const res = await axiosInstance.get("/quiz/result/latest")
            if (res.data) {
                setResult(res.data)
                // update cache
                localStorage.setItem("latestQuizResult", JSON.stringify(res.data))
            } else {
                router.push("/quiz")
            }
        } catch (error) {
            console.error("Failed to load result", error)
            router.push("/quiz")
        } finally {
            setLoading(false)
        }
    }

    fetchResult()
  }, [router])

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
         <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return <QuizReport result={result} showRetake={true} />
}
