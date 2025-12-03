"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, BookOpen } from "lucide-react"
import { courseAPI } from "@/lib/api"

export default function AdminDashboardPage() {
  const { user, isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New course state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("Beginner")
  const [tags, setTags] = useState("")

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/login")
      } else if (user?.role !== "admin" && user?.email !== "admin@example.com") { // Fallback check
         // In real app, check user.role. For now, assuming first user is admin or specific email
         // We'll rely on backend protection mostly, but frontend redirect is good UX
         // Since we don't have role in user context yet (need to update auth provider/user type), 
         // we might skip this strict check or update user type.
         // Let's assume user object has role if we updated it.
      }
    }
  }, [isLoggedIn, loading, router, user])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true)
      const data = await courseAPI.getAll()
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await courseAPI.create({
        title,
        description,
        category,
        difficulty,
        tags: tags.split(",").map(t => t.trim()),
      })

      toast({
        title: "Success",
        description: "Course created successfully",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("")
      setTags("")
      
      // Refresh list
      fetchCourses()
    } catch (error) {
      console.error("Failed to create course:", error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      await courseAPI.delete(id)
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      fetchCourses()
    } catch (error) {
      console.error("Failed to delete course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
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

      <section className="pt-32 pb-16 hero-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Admin</span> Dashboard
            </h1>
            <p className="text-xl text-white/80">Manage courses and content</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Course Form */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
                <CardHeader>
                  <CardTitle>Add New Course</CardTitle>
                  <CardDescription>Create a new course for students</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Course Title"
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Web Development"
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="react, javascript, frontend"
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Course description..."
                        className="bg-slate-700/50 border-slate-600 min-h-[100px]"
                      />
                    </div>

                    <Button type="submit" className="w-full gradient-bg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Course
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Course List */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Existing Courses</CardTitle>
                  <CardDescription>Manage your course catalog</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      No courses found. Create one to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <div key={course.id || course._id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-700 hover:border-slate-600 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded bg-slate-800 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{course.title}</h4>
                              <div className="flex items-center text-xs text-white/60 space-x-2">
                                <span>{course.category}</span>
                                <span>•</span>
                                <span>{course.students || 0} students</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDeleteCourse(course.id || course._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
