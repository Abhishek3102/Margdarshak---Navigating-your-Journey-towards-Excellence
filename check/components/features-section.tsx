"use client"
import { useInView } from "react-intersection-observer"
import { BookOpen, Users, TrendingUp, MessageSquare, Award, Compass } from "lucide-react"

export function FeaturesSection() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Personalized Learning Paths",
      description: "Courses tailored to your skill level, goals, and learning style.",
      delay: 0,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Mentorship",
      description: "Connect with industry professionals for guidance and feedback.",
      delay: 100,
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "Visualize your growth with detailed analytics and insights.",
      delay: 200,
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Community Discussions",
      description: "Engage with peers to share knowledge and solve challenges together.",
      delay: 300,
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Certifications",
      description: "Earn recognized credentials to showcase your expertise.",
      delay: 400,
    },
    {
      icon: <Compass className="h-8 w-8" />,
      title: "Smart Recommendations",
      description: "Discover new courses based on your interests and progress.",
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
            <span className="gradient-text">Features</span> Designed for Your Success
          </h2>
          <p
            className={`text-lg text-white/70 transition-all duration-700 delay-200 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Our platform combines cutting-edge technology with proven learning methodologies to help you achieve your
            goals.
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
