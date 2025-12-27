"use client"
import { useInView } from "react-intersection-observer"
import { BookOpen, Users, TrendingUp, MessageSquare, Award, Compass, BrainCircuit, FileText, CheckCircle } from "lucide-react"

export function FeaturesSection() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Syllabus Aligned Content",
      description: "Strictly follows NCERT and State Board curriculum for Class 8, 9, and 10.",
      delay: 0,
    },
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: "AI Personal Tutor",
      description: "Stuck on a math problem? Our AI explains it step-by-step instantly.",
      delay: 100,
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Smart Progress Tracking",
      description: "Identify your weak areas and get recommendations to improve.",
      delay: 200,
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Revision Notes & Summaries",
      description: "Quick-read notes for last minute revision before exams.",
      delay: 300,
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Chapter-wise Quizzes",
      description: "Test your knowledge after every chapter to ensure concept mastery.",
      delay: 400,
    },
    {
      icon: <Compass className="h-8 w-8" />,
      title: "Career Guidance",
      description: "Explore future streams and career paths based on your interests.",
      delay: 500,
    },
  ]

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Everything you need to <span className="gradient-text">Top Your Exams</span>
          </h2>
          <p
            className={`text-lg text-white/70 transition-all duration-700 delay-200 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            We go beyond just videos. Margdarshak provides a complete ecosystem for academic success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 transition-all duration-700 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
