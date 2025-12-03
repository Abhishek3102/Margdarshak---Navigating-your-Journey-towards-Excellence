"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/course-card"
import { CourseFilter, type FilterOptions } from "@/components/course-filter"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { courseAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import React from "react"

interface Course {
  _id: string
  id?: string
  title: string
  description: string
  image: string
  category: string
  level: string
  duration: string
  students: number
  rating: number
  enrolled?: boolean
}

export default function CoursesPage() {
  const { isLoggedIn } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})

  useEffect(() => {
    let isMounted = true

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await courseAPI.getAll(filters)
        const coursesData = response.data || []

        // If user is logged in, fetch enrolled courses to mark them
        if (isLoggedIn && isMounted) {
          try {
            const enrolledResponse = await courseAPI.getEnrolled()
            const enrolledData = enrolledResponse.data || []
            const enrolledIds = enrolledData.map((course: any) => course._id || course.id)

            if (isMounted) {
              setEnrolledCourseIds(enrolledIds)

              // Mark enrolled courses
              const coursesWithEnrollment = coursesData.map((course: Course) => ({
                ...course,
                enrolled: enrolledIds.includes(course._id || course.id),
              }))

              setCourses(coursesWithEnrollment)
            }
          } catch (error) {
            console.error("Failed to fetch enrolled courses:", error)
            if (isMounted) {
              setCourses(coursesData)
            }
          }
        } else if (isMounted) {
          setCourses(coursesData)
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        if (isMounted) {
          setCourses([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCourses()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [filters, isLoggedIn])

  const handleFilterChange = React.useCallback((newFilters: FilterOptions) => {
    setFilters((prevFilters) => {
      // Only update if filters actually changed
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters
      }
      return prevFilters
    })
  }, [])

  const handleEnroll = (courseId: string) => {
    setEnrolledCourseIds((prev) => [...prev, courseId])
    setCourses((prev) => prev.map((course) => ((course._id || course.id) === courseId ? { ...course, enrolled: true } : course)))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <section className="pt-32 pb-16 hero-bg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Explore</span> Our Courses
            </h1>
            <p className="text-xl text-white/80">Discover learning paths tailored to your goals and interests</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <CourseFilter onFilterChange={handleFilterChange} />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-white/70">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => (
                <CourseCard key={course._id || course.id} course={course} onEnroll={handleEnroll} />
              ))}
            </div>
          )}

          {courses.length > 0 && !loading && (
            <div className="flex justify-center mt-12">
              <Button variant="outline" className="border-purple-500 text-white hover:bg-purple-500/20">
                Load More Courses
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
