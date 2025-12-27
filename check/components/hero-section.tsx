"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"
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
          <h1
            className={`text-4xl md:text-6xl font-bold mb-6 transition-all duration-1000 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="gradient-text">Navigating</span> your Journey towards Excellence
          </h1>

          <p
            className={`text-xl md:text-2xl text-white/80 mb-8 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Discover personalized courses, connect with mentors, and track your progress on the path to mastery.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <Link href="/courses">
              <Button className="gradient-bg text-white hover:opacity-90 px-8 py-6 text-lg">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/recommendations">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg">
                Get Recommendations
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
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Courses</h3>
              <p className="text-white/70">Expert-designed learning paths tailored to your goals and skill level.</p>
            </div>

            <div className="glass-effect rounded-xl p-6 transform transition-transform hover:scale-105">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-white/70">Connect with peers and mentors to enhance your learning experience.</p>
            </div>

            <div className="glass-effect rounded-xl p-6 transform transition-transform hover:scale-105">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-white/70">Monitor your achievements and growth with detailed analytics.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  )
}
