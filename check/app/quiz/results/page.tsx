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
}

import axiosInstance from "@/lib/axios"

export default function QuizResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
        // 1. Try to get from Local Storage first (Fastest)
        const stored = localStorage.getItem("quizResult")
        if (stored) {
            setResult(JSON.parse(stored))
            setLoading(false)
            return
        }

        // 2. Fallback: Fetch from Server
        try {
            const res = await axiosInstance.get("/quiz/result/latest")
            if (res.data) {
                setResult(res.data)
            } else {
                // No result found anywhere, start new quiz
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
