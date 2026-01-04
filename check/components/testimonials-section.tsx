"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote, ChevronLeft, ChevronRight } from "lucide-react"

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
      avatar: "/images/avatars/aarav.png",
      content:
        "The animation-based videos helped me visualize complex Physics concepts. I scored 98% in my Science Pre-boards thanks to Margdarshak! The way it adapts to my learning speed is incredible.",
    },
    {
      id: 2,
      name: "Mrs. Sharma",
      role: "Parent of Class 8 Student",
      avatar: "/images/avatars/sharma.png",
      content:
        "I was worried about my son's Math anxiety. The AI tutor and step-by-step explanations have boosted his confidence immensely. Now he actually looks forward to his study sessions!",
    },
    {
      id: 3,
      name: "Priya Singh",
      role: "Class 9 Student",
      avatar: "/images/avatars/priya.png",
      content:
        "The practice quizzes after every chapter are a game changer. I know exactly where I am weak, and the app suggests videos to fix it. It feels like having a personal tutor 24/7.",
    },
    {
      id: 4,
      name: "Mr. Verma",
      role: "Senior Science Teacher",
      avatar: "/images/avatars/verma.png",
      content:
        "As a teacher, I love how Margdarshak complements classroom learning. It reinforces concepts perfectly, making my job easier and helping students grasp difficult topics faster.",
    },
    {
      id: 5,
      name: "Rohan Kumar",
      role: "Class 7 Student",
      avatar: "/images/avatars/rohan.png",
      content:
        "Physics used to be boring, but now it's my favorite subject! The gamified lessons make learning fun, almost like playing a video game but for studies.",
    },
  ]

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 transition-all duration-700 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Success</span> Stories
          </h2>
          <p
            className={`text-xl text-slate-300 transition-all duration-700 delay-200 ${
              inView ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            Real feedback from the community building their future with Margdarshak.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="relative h-[500px] md:h-[400px]">
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={testimonial.id}
                  className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out transform ${
                    isActive 
                      ? "opacity-100 translate-x-0 scale-100 z-20" 
                      : "opacity-0 translate-x-8 scale-95 z-10 pointer-events-none"
                  }`}
                >
                  <Card className="h-full bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <CardContent className="p-0 h-full flex flex-col md:flex-row">
                      {/* Left Side: Image & Profile */}
                      <div className="w-full md:w-1/3 bg-slate-950/50 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-800 relative group-hover:bg-slate-900/50 transition-colors">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity" />
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-slate-800 shadow-xl relative z-10">
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} className="object-cover" />
                              <AvatarFallback className="bg-slate-800 text-2xl">{testimonial.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{testimonial.name}</h3>
                        <p className="text-purple-400 font-medium">{testimonial.role}</p>
                      </div>

                      {/* Right Side: Content */}
                      <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-center relative">
                        <Quote className="absolute top-8 left-8 h-12 w-12 text-slate-700/50 rotate-180" />
                        <Quote className="absolute bottom-8 right-8 h-12 w-12 text-slate-700/50" />
                        
                        <blockquote className="text-xl md:text-2xl text-slate-200 leading-relaxed italic z-10 relative px-4">
                          "{testimonial.content}"
                        </blockquote>
                        
                        {/* Rating decoration */}
                        <div className="flex gap-1 mt-6 px-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-current">★</div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button 
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-slate-800 text-white hover:bg-purple-600 transition-all hover:scale-110 border border-slate-700"
                aria-label="Previous testimonial"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="flex gap-2">
                {testimonials.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? "w-8 bg-purple-500" : "w-2 bg-slate-600 hover:bg-slate-500"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                />
                ))}
            </div>

            <button 
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-slate-800 text-white hover:bg-purple-600 transition-all hover:scale-110 border border-slate-700"
                aria-label="Next testimonial"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
