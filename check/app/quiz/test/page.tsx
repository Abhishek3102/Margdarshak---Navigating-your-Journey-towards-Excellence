
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { quizAPI } from "@/services/quizAPI"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Question {
  id: number
  subject: string
  difficulty: string
  question: string
  options: Record<string, string>
  hint: string
}

export default function activeQuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeTaken, setTimeTaken] = useState<Record<string, number>>({})
  const [hintsUsedCount, setHintsUsedCount] = useState(0)
  const [activeHint, setActiveHint] = useState<string | null>(null)
  
  // Timer Refs
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    loadQuiz()
  }, [])

  // Reset timer on question change
  useEffect(() => {
    startTimeRef.current = Date.now()
    setActiveHint(null)
  }, [currentIndex])

  const loadQuiz = async () => {
    try {
      const data = await quizAPI.start()
      setQuestions(data.questions)
    } catch (error) {
      toast.error("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (optKey: string) => {
    const currentQ = questions[currentIndex]
    setAnswers(prev => ({ ...prev, [String(currentQ.id)]: optKey }))
  }

  const handleNext = () => {
    // Record time
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const currentQ = questions[currentIndex]
    setTimeTaken(prev => ({ 
      ...prev, 
      [String(currentQ.id)]: (prev[String(currentQ.id)] || 0) + elapsed 
    }))

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const useHint = () => {
    if (hintsUsedCount >= 3) {
      toast.warning("You have used all 3 available hints!")
      return
    }
    setHintsUsedCount(prev => prev + 1)
    setActiveHint(questions[currentIndex].hint)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Record final question time
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const currentQ = questions[currentIndex]
      const finalTimeTaken = { 
        ...timeTaken, 
        [String(currentQ.id)]: (timeTaken[String(currentQ.id)] || 0) + elapsed 
      }

      const result = await quizAPI.submit({
        answers,
        time_taken: finalTimeTaken
      })

      // Store result in localStorage to display on results page (simple way to pass data)
      localStorage.setItem("latestQuizResult", JSON.stringify(result))
      router.push("/quiz/results")
    } catch (error) {
      toast.error("Failed to submit quiz")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading specific diagnostic test...</span>
      </div>
    )
  }

  if (questions.length === 0) {
    return <div className="p-8 text-center">No questions found for your class.</div>
  }

  const currentQ = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {currentQ.subject} • {currentQ.difficulty}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${hintsUsedCount >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
             <Lightbulb className="w-4 h-4" />
             {3 - hintsUsedCount} Hints Left
           </div>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-8" />

      {/* Question Card */}
      <Card className="mb-8 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl leading-relaxed">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(currentQ.options).map(([key, text]) => (
            <div
              key={key}
              onClick={() => handleOptionSelect(key)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-4
                ${
                  answers[String(currentQ.id)] === key
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                }
              `}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${answers[String(currentQ.id)] === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {key}
              </div>
              <span className="text-lg">{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={useHint} 
          disabled={hintsUsedCount >= 3 || !!activeHint}
          className="gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          {activeHint ? "Hint Shown" : "Get Hint"}
        </Button>

        <Button 
            onClick={handleNext} 
            disabled={!answers[String(currentQ.id)] || submitting}
            size="lg"
            className="gap-2"
        >
          {submitting ? (
            <>Submitting <Loader2 className="w-4 h-4 animate-spin"/></>
          ) : currentIndex === questions.length - 1 ? (
             "Submit Test"
          ) : (
            <>Next Question <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>

      {/* Hint Dialog (Or simpler inline alert) */}
      {activeHint && (
        <div className="mt-6 p-4 bg-yellow-50/50 border border-yellow-200 rounded-lg flex gap-3 text-yellow-800 animate-in fade-in slide-in-from-bottom-2">
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm italic">{activeHint}</p>
        </div>
      )}

    </div>
  )
}
