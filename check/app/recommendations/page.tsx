"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/course-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Award, Clock, BookOpen } from "lucide-react"
import { recommendationAPI, courseAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

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
  match: number
}

interface LearningPath {
  id: string
  title: string
  description: string
  courses: number
  duration: string
  level: string
}

export default function RecommendationsPage() {
  const { isLoggedIn } = useAuth()
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const data = await recommendationAPI.get()

        if (data.courses) {
          setRecommendations(data.courses)
        }

        if (data.paths) {
          setLearningPaths(data.paths)
        }

        // Get enrolled courses to mark them
        if (isLoggedIn) {
          try {
            const enrolledResponse = await courseAPI.getEnrolled()
            const enrolledIds = (enrolledResponse || []).map((course: any) => course._id || course.id)
            setEnrolledCourseIds(enrolledIds)
          } catch (error) {
            console.error("Failed to fetch enrolled courses:", error)
          }
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
        setRecommendations([])
        setLearningPaths([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [isLoggedIn])

  const handleEnroll = (courseId: string) => {
    setEnrolledCourseIds((prev) => [...prev, courseId])
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
                <span className="gradient-text">Personalized</span> Recommendations
              </h1>
              <p className="text-xl text-white/80">Courses and learning paths tailored to your goals and interests</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <>
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    <span className="gradient-text">Recommended</span> Courses
                  </h2>
                  <p className="text-white/70">Based on your profile, interests, and learning history</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {recommendations.map((course: any) => (
                    <CourseCard
                      key={course._id || course.id}
                      course={{
                        ...course,
                        enrolled: enrolledCourseIds.includes(course._id || course.id),
                      }}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    <span className="gradient-text">Learning</span> Paths
                  </h2>
                  <p className="text-white/70">Structured course sequences to help you achieve specific career goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {learningPaths.map((path) => (
                    <Card
                      key={path.id}
                      className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{path.title}</CardTitle>
                            <CardDescription className="text-white/70 mt-1">{path.description}</CardDescription>
                          </div>
                          <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                            <Award className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>{path.courses} courses</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{path.duration}</span>
                          </div>
                          <span className="text-white/80">{path.level}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full gradient-bg text-white hover:opacity-90">View Path</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
