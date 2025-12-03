"use client"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { courseAPI } from "@/lib/api"

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
}

export function CoursesSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchCourses = async () => {
      try {
        setLoading(true)

        // Wrap in try-catch to handle any unexpected errors
        try {
          const data = await courseAPI.getAll()

          if (isMounted) {
            if (Array.isArray(data) && data.length > 0) {
              setCourses(data.slice(0, 3)) // Only show first 3 courses on homepage
            } else {
              console.warn("Invalid or empty data received from API")
              setCourses([])
            }
          }
        } catch (error) {
          console.error("Error fetching courses:", error)
          if (isMounted) {
            setCourses([])
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCourses()

    return () => {
      isMounted = false
    }
  }, [])

  const handleEnroll = async (courseId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      })
      return
    }

    try {
      await courseAPI.enroll(courseId)
      toast({
        title: "Success",
        description: "You have successfully enrolled in this course",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enroll in course",
        variant: "destructive",
      })
    }
  }

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="max-w-2xl">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${
                inView ? "opacity-100" : "opacity-0 translate-y-10"
              }`}
            >
              <span className="gradient-text">Popular</span> Courses
            </h2>
            <p
              className={`text-lg text-white/70 transition-all duration-700 delay-200 ${
                inView ? "opacity-100" : "opacity-0 translate-y-10"
              }`}
            >
              Explore our most sought-after learning paths designed to help you master new skills.
            </p>
          </div>
          <Link
            href="/courses"
            className={`mt-4 md:mt-0 transition-all duration-700 delay-400 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <Button variant="outline" className="border-purple-500 text-white hover:bg-purple-500/20">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse-slow">Loading courses...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/70">No courses available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Card
                key={course.id}
                className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={course.image || "/placeholder.svg?height=200&width=400"}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="gradient-bg text-white border-none">{course.category}</Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/20">
                      {course.level}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-white/70">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gradient-bg text-white hover:opacity-90"
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
