"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FeedbackForm } from "@/components/feedback-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { courseAPI, feedbackAPI } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"

interface Course {
  id: string
  title: string
}

export default function FeedbackPage() {
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [quickFeedback, setQuickFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isLoggedIn) return

      try {
        setLoading(true)
        const data = await courseAPI.getEnrolled()
        setEnrolledCourses(data)
        if (data.length > 0) {
          setSelectedCourse(data[0]._id || data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [isLoggedIn])

  const handleQuickFeedback = async (type: string) => {
    try {
      setQuickFeedback(type)
      await feedbackAPI.submit({
        type: "quick",
        feedback: type,
      })

      toast({
        title: "Quick Feedback Submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setQuickFeedback(null)
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />

        <section className="pt-32 pb-16 hero-bg relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Share</span> Your Feedback
              </h1>
              <p className="text-xl text-white/80">Help us improve your learning experience</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : enrolledCourses.length > 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">Course Feedback</CardTitle>
                          <CardDescription className="text-white/70 mt-1">
                            Rate and review your enrolled courses
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <Label>Select a course to review</Label>
                          <RadioGroup value={selectedCourse} onValueChange={setSelectedCourse}>
                            {enrolledCourses.map((course: any) => (
                              <div key={course._id || course.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={course._id || course.id} id={course._id || course.id} />
                                <Label htmlFor={course._id || course.id}>{course.title}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        {selectedCourse && (
                          <FeedbackForm
                            type="course"
                            courseId={selectedCourse}
                            courseName={enrolledCourses.find((c) => c.id === selectedCourse)?.title}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl">Course Feedback</CardTitle>
                      <CardDescription className="text-white/70">
                        You haven't enrolled in any courses yet
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <p className="text-white/70 mb-6">Enroll in courses to provide feedback</p>
                      <Button className="gradient-bg text-white hover:opacity-90" asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <FeedbackForm type="platform" />

                <div className="glass-effect rounded-xl p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">Quick Feedback</h3>
                  <p className="text-white/70 mb-6">
                    How would you rate your experience with our recommendation system?
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500/20"
                      onClick={() => handleQuickFeedback("helpful")}
                      disabled={quickFeedback === "helpful"}
                    >
                      {quickFeedback === "helpful" ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ThumbsUp className="mr-2 h-5 w-5" />
                      )}
                      Helpful
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/20"
                      onClick={() => handleQuickFeedback("needs_improvement")}
                      disabled={quickFeedback === "needs_improvement"}
                    >
                      {quickFeedback === "needs_improvement" ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ThumbsDown className="mr-2 h-5 w-5" />
                      )}
                      Needs Improvement
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
