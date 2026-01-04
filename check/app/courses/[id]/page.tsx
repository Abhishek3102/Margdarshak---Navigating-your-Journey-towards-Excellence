"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackForm } from "@/components/feedback-form"
import { Loader2, Clock, Users, Star, BookOpen, CheckCircle } from "lucide-react"
import { courseAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import Image from "next/image"

interface Course {
  id: string
  title: string
  description: string
  image: string
  category: string
  level: string
  duration: string
  students: number
  rating: number
  content?: {
    sections: {
      title: string
      lessons: {
        title: string
        duration: string
        completed?: boolean
      }[]
    }[]
  }
}

interface EnrolledCourse {
  _id?: string
  id?: string
}

export default function CoursePage() {
  const { id } = useParams()
  const { isLoggedIn } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const data = await courseAPI.getById(id as string)
        setCourse(data)

        // Check if user is enrolled
        if (isLoggedIn) {
          try {
            const enrolledResponse = await courseAPI.getEnrolled()
            const enrolledCourses: EnrolledCourse[] = enrolledResponse || []
            setEnrolled(enrolledCourses.some((c) => (c._id || c.id) === id))
          } catch (error) {
            console.error("Failed to check enrollment status:", error)
          }
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCourse()
    }
  }, [id, isLoggedIn])

  const handleEnroll = async () => {
    try {
      await courseAPI.enroll(id as string)
      setEnrolled(true)
    } catch (error) {
      console.error("Failed to enroll:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
            <p className="text-white/70 mb-8">The course you're looking for doesn't exist or has been removed.</p>
            <Button className="gradient-bg text-white hover:opacity-90" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />

        <section className="pt-32 pb-16 hero-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-1/3">
                  <div className="relative h-64 w-full rounded-xl overflow-hidden">
                    <Image
                      src={course.image || "/placeholder.svg?height=300&width=400"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <Badge className="gradient-bg text-white border-none mb-4">{course.category}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                  <p className="text-white/80 mb-6">{course.description}</p>

                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-400" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-400" />
                      <span>{(course.students || 0).toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-400" />
                      <span>{course.level}</span>
                    </div>
                  </div>

                  {enrolled ? (
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Enrolled
                    </Button>
                  ) : (
                    <Button className="gradient-bg text-white hover:opacity-90" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="content">
                <TabsList className="mb-8">
                  <TabsTrigger value="content">Course Content</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle>Course Curriculum</CardTitle>
                      <CardDescription>What you'll learn in this course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {course.content?.sections ? (
                        <div className="space-y-6">
                          {course.content.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-3">
                              <h3 className="text-lg font-semibold">{section.title}</h3>
                              <div className="space-y-2">
                                {section.lessons.map((lesson, lessonIndex) => (
                                  <div
                                    key={lessonIndex}
                                    className="p-3 bg-slate-700/50 rounded-lg flex justify-between items-center"
                                  >
                                    <div className="flex items-center">
                                      {lesson.completed ? (
                                        <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                                      ) : (
                                        <div className="h-5 w-5 mr-3 rounded-full border border-white/30" />
                                      )}
                                      <span>{lesson.title}</span>
                                    </div>
                                    <span className="text-sm text-white/60">{lesson.duration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-white/70">Course content is being prepared. Check back soon!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback">
                  <FeedbackForm type="course" courseId={course.id} courseName={course.title} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
