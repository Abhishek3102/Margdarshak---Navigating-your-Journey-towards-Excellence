"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { courseAPI } from "@/lib/api"
import Link from "next/link"

interface CourseCardProps {
  course: {
    _id?: string
    id?: string
    title: string
    description: string
    image: string
    category: string
    level: string
    duration: string
    students: number
    rating: number
    match?: number
    enrolled?: boolean
  }
  onEnroll?: (courseId: string) => void
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [isEnrolling, setIsEnrolling] = useState(false)

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      })
      return
    }

    try {
      setIsEnrolling(true)
      const courseId = course._id || course.id || ""
      if (!courseId) throw new Error("Course ID not found")
      
      await courseAPI.enroll(courseId)

      toast({
        title: "Success",
        description: "You have successfully enrolled in this course",
      })

      if (onEnroll) {
        onEnroll(courseId)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enroll in course",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10">
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
          {course.match ? (
            <Badge className="bg-purple-600 text-white border-none">{course.match}% Match</Badge>
          ) : (
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/20">
              {course.level}
            </Badge>
          )}
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
        {course.enrolled ? (
          <Link href={`/courses/${course._id || course.id}`} className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Continue Learning</Button>
          </Link>
        ) : (
          <Button
            className="w-full gradient-bg text-white hover:opacity-90"
            onClick={handleEnroll}
            disabled={isEnrolling}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              "Enroll Now"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
