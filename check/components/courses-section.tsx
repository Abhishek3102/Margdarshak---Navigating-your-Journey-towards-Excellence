"use client"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, ArrowRight, BrainCircuit, Lock, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useWebSocket } from "@/components/websocket-provider"

// Custom Modal for Permission Request
const PermissionModal = ({ targetClass, onClose }: { targetClass: string, onClose: () => void }) => {
    const [sent, setSent] = useState(false)
    const { sendMessage } = useWebSocket()
    const { user } = useAuth()

    const handleSendRequest = () => {
        // REAL WebSocket Send
        sendMessage({
            type: "ACCESS_REQUEST",
            targetClass: targetClass,
            studentName: user?.name || "Unknown Student",
            studentId: user?.id
        })

        setSent(true)
        // toast.success(`Access request for ${targetClass} sent to platform teachers.`) - handled by WS echo or UI state
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl transform transition-all scale-100">
                {!sent ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Restricted Access</h3>
                            <p className="text-slate-400">
                                You are currently enrolled in your own standard. To access <span className="text-white font-semibold">{targetClass}</span>, you need teacher approval.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white" onClick={handleSendRequest}>
                                <Send className="w-4 h-4 mr-2" /> Request Access
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                         <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Request Sent</h3>
                            <p className="text-slate-400">
                                Your request has been sent to all teachers. You will be notified via the notification bell once they approve.
                            </p>
                        </div>
                        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white" onClick={onClose}>
                            Close
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

export function CoursesSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })
  const { user } = useAuth()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [targetClass, setTargetClass] = useState("")

  // Hardcoded Academic Context
  const classes = [
    {
      id: "class-8",
      title: "Class 8 Foundation",
      grade: "Class 8",
      description: "Build a strong base in Math, Science, and Social Studies. Perfect for Olympiad prep.",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      level: "Foundation",
      subjects: ["Mathematics", "Science", "History", "Civics"],
      students: "1.2k"
    },
    {
      id: "class-9",
      title: "Class 9 Core",
      grade: "Class 9",
      description: "Master complex concepts and prepare for the transition to Board years.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      level: "Intermediate",
      subjects: ["Mathematics I & II", "Science", "Geography", "History"],
      students: "2.5k"
    },
    {
      id: "class-10",
      title: "Class 10 Board Prep",
      grade: "Class 10",
      description: "Comprehensive Board Exam preparation with previous year questions and mock tests.",
      image: "https://images.unsplash.com/photo-1427504746074-ce47ab719539?w=800&q=80",
      level: "Board Exam",
      subjects: ["All Subjects", "Mock Tests", "Revision Notes"],
      students: "3.8k"
    }
  ]

  const handleClassClick = (cls: any) => {
      // Logic:
      // 1. If user is teacher/admin => Allow
      // 2. If user grade matches => Allow
      // 3. Else => Show Modal

      if (!user) {
          toast.error("Please login first")
          return
      }

      if (user.role === 'teacher' || user.role === 'admin') {
          router.push(`/dashboard`) // Or specific class link
          return
      }

      // Check Grade Match
      // Normalized check: "Class 8" included in "student 1 class 8" or direct match
      // Also handle case where user.grade isn't set but name implies it
      const userGrade = user.grade || user.name || ""
      
      const isAllowed = userGrade.toLowerCase().includes(cls.grade.toLowerCase())
      
      if (isAllowed) {
          router.push(`/dashboard`) 
      } else {
          setTargetClass(cls.grade)
          setModalOpen(true)
      }
  }

  return (
    <>
    {modalOpen && <PermissionModal targetClass={targetClass} onClose={() => setModalOpen(false)} />}
    
    <section ref={ref} className="py-24 bg-gradient-to-b from-slate-800 to-slate-900" id="courses">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="max-w-2xl">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${
                inView ? "opacity-100" : "opacity-0 translate-y-10"
              }`}
            >
              Select Your <span className="gradient-text">Class</span>
            </h2>
            <p
              className={`text-lg text-white/70 transition-all duration-700 delay-200 ${
                inView ? "opacity-100" : "opacity-0 translate-y-10"
              }`}
            >
               Tailored learning paths aligned with your school curriculum.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {classes.map((cls, index) => (
              <Card
                key={cls.id}
                className={`cursor-pointer bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onClick={() => handleClassClick(cls)}
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={cls.image}
                    alt={cls.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/20">
                      {cls.level}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl flex justify-between items-center">
                      {cls.title}
                      {/* Simple visual indicator if locked? Maybe later */}
                  </CardTitle>
                  <CardDescription className="text-white/70">{cls.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cls.subjects.map(subj => (
                        <Badge key={subj} variant="secondary" className="bg-slate-700 text-slate-200 hover:bg-slate-600">
                            {subj}
                        </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gradient-bg text-white hover:opacity-90">
                        Start Learning
                        <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </section>
    </>
  )
}
