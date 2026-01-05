"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CoursesSection } from "@/components/courses-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FaqSection } from "@/components/faq-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { TeacherHome } from "@/components/teacher-home"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { user, isLoggedIn, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin"/>
        </div>
    )
  }

  // Teacher View (Distinct from Student/Guest)
  if (isLoggedIn && user?.role === 'teacher') {
      return <TeacherHome user={user} />
  }

  // Standard Landing Page (Student / Guest)
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <TestimonialsSection />
      <FaqSection />
      <Footer />
    </main>
  )
}
