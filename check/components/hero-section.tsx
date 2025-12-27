"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award, PlayCircle } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-block mb-4 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium transition-all duration-1000 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-4'}`}>
              🚀 For Classes 8, 9, and 10
          </div>
          <h1
            className={`text-4xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Your Personal Guide to <span className="gradient-text">Academic Excellence</span>
          </h1>

          <p
            className={`text-xl md:text-2xl text-white/80 mb-8 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Master Maths, Science, and History with interactive video lessons, smart quizzes, and AI-powered progress tracking.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <Link href="/dashboard">
              <Button className="gradient-bg text-white hover:opacity-90 px-8 py-6 text-lg rounded-full">
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#courses">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full">
                Explore Classes
              </Button>
            </Link>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="glass-effect rounded-xl p-6 transform transition-transform hover:scale-105">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Lessons</h3>
              <p className="text-white/70">Chapter-wise explanations simplifying complex concepts.</p>
            </div>

            <div className="glass-effect rounded-xl p-6 transform transition-transform hover:scale-105">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Doubt Solving</h3>
              <p className="text-white/70">Get instant help from our AI Tutor and community mentors.</p>
            </div>

            <div className="glass-effect rounded-xl p-6 transform transition-transform hover:scale-105">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exam Success</h3>
              <p className="text-white/70">Practice with mock tests and previous year questions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  )
}
