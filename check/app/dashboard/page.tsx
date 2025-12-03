"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BookOpen, Award, Clock, TrendingUp, Calendar } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { recommendationAPI, courseAPI } from "@/lib/api"

export default function DashboardPage() {
  const { user, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, loading, router])

  useEffect(() => {
    if (isLoggedIn) {
      fetchData()
    }
  }, [isLoggedIn])

  const fetchData = async () => {
    try {
      const [recResponse, enrolledResponse] = await Promise.all([
        recommendationAPI.get(),
        courseAPI.getEnrolled()
      ])
      setRecommendations(recResponse.data || [])
      setEnrolledCourses(enrolledResponse.data || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <section className="pt-32 pb-16 hero-bg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Your</span> Dashboard
            </h1>
            <p className="text-xl text-white/80">Track your progress and manage your learning journey</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Enrolled Courses</p>
                  <h3 className="text-2xl font-bold">{enrolledCourses.length}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mr-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Completed Courses</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Learning Hours</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Current Streak</p>
                  <h3 className="text-2xl font-bold">0 days</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Your Courses</CardTitle>
                  <CardDescription>Track your progress in enrolled courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {enrolledCourses.length === 0 ? (
                        <div className="text-center py-8 text-white/50">
                            You haven't enrolled in any courses yet.
                        </div>
                    ) : (
                        enrolledCourses.map((course: any) => (
                            <div key={course._id || course.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">{course.title}</h4>
                                    <span className="text-sm text-white/60">0% Complete</span>
                                </div>
                                <Progress value={0} className="h-2 bg-slate-700" />
                                <div className="flex justify-between text-sm text-white/60">
                                    <span>Start learning</span>
                                    <Link href={`/courses/${course._id || course.id}`} className="text-purple-400 hover:text-purple-300">
                                    Continue
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                  </div>

                  <div className="mt-6">
                    <Button className="w-full gradient-bg text-white hover:opacity-90" onClick={() => router.push('/courses')}>Browse More Courses</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled learning sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4 text-white/50 text-sm">
                        No upcoming sessions
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Recommended Next</CardTitle>
                  <CardDescription>Based on your interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.length === 0 ? (
                        <div className="text-center py-4 text-white/50 text-sm">
                            No recommendations yet
                        </div>
                    ) : (
                        recommendations.map((course: any) => (
                            <div key={course._id || course.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => router.push(`/courses/${course._id || course.id}`)}>
                                <h4 className="font-medium">{course.title}</h4>
                                <p className="text-sm text-white/60 line-clamp-1">{course.description}</p>
                            </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
