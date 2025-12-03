"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { feedbackAPI } from "@/lib/api"

interface FeedbackFormProps {
  type: "course" | "platform"
  courseId?: string
  courseName?: string
  onSuccess?: () => void
}

export function FeedbackForm({ type, courseId, courseName, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState<number>(0)
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const data = {
        type,
        rating,
        feedback,
        ...(courseId && { courseId }),
      }

      await feedbackAPI.submit(data)

      toast({
        title: "Feedback Submitted",
        description: `Thank you for your feedback${type === "course" ? " on this course" : ""}!`,
      })

      // Reset form
      setRating(0)
      setFeedback("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{type === "course" ? `Rate "${courseName}"` : "Platform Feedback"}</CardTitle>
        <CardDescription className="text-white/70">
          {type === "course" ? "Share your experience with this course" : "Help us improve your overall experience"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Label>
              {type === "course"
                ? "How would you rate this course?"
                : "How would you rate your experience with our platform?"}
            </Label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  className={`h-10 w-10 p-0 ${
                    rating === value
                      ? "bg-purple-500/20 border-purple-500"
                      : "border-slate-700 hover:bg-purple-500/20 hover:border-purple-500"
                  }`}
                  onClick={() => setRating(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="feedback">Your feedback</Label>
            <Textarea
              id="feedback"
              placeholder={
                type === "course"
                  ? "Share your experience with this course..."
                  : "What features would you like to see added or improved?"
              }
              className="min-h-[120px] bg-slate-800/50 border-slate-700"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full gradient-bg text-white hover:opacity-90" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
