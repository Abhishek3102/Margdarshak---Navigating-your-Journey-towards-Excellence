"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

export function TestimonialsSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Aarav Patel",
      role: "Class 10 Student",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "The animation-based videos helped me visualize complex Physics concepts. I scored 98% in my Science Pre-boards thanks to Margdarshak!",
    },
    {
      id: 2,
      name: "Mrs. Sharma",
      role: "Parent of Class 8 Student",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "I was worried about my son's Math anxiety. The AI tutor and step-by-step explanations have boosted his confidence immensely. Highly recommended.",
    },
    {
      id: 3,
      name: "Rohan Kumar",
      role: "Class 9 Student",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "The practice quizzes after every chapter are a game changer. I know exactly where I am weak and the app suggests videos to fix it.",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="gradient-text">Success</span> Stories
          </h2>
          <p
            className={`text-lg text-white/70 transition-all duration-700 delay-200 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Hear from students and parents who trust Margdarshak.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-10 -left-10 opacity-20">
            <Quote className="h-24 w-24 text-purple-500" />
          </div>

          <div className="relative z-10 grid grid-cols-1">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-700 col-start-1 row-start-1 w-full ${
                  index === activeIndex ? "opacity-100 translate-x-0 z-10" : "opacity-0 translate-x-20 -z-10 pointer-events-none"
                }`}
              >
                <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
                  <CardContent className="p-8">
                    <p className="text-lg md:text-xl italic mb-6 text-white/90">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                        <AvatarFallback className="gradient-bg">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-white/70">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full mx-1 transition-all ${
                  index === activeIndex ? "bg-purple-500 scale-125" : "bg-slate-600"
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
