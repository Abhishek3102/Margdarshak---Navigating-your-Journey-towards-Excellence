"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

export function FaqSection() {
  const faqs = [
    {
      question: "How does the AI Personal Tutor work?",
      answer: "Our AI tutor analyzes your learning style, quiz performance, and interaction patterns to create a customized study plan. It identifies your weak areas and suggests specific videos, summaries, and practice questions to help you improve."
    },
    {
      question: "Is Margdarshak compliant with my school curriculum?",
      answer: "Yes! Margdarshak covers major Indian educational boards including CBSE, ICSE, and various State Boards for classes 6 to 12. We regularly update our content to align with the latest syllabus changes."
    },
    {
      question: "Can parents track their child's progress?",
      answer: "Absolutely. Parents have a dedicated dashboard where they can see detailed analytics on their child's performance, time spent learning, and areas that need attention. You get weekly reports delivered to your inbox."
    },
    {
      question: "Is the platform free to use?",
      answer: "Margdarshak offers a comprehensive Free Tier that gives access to core lessons and quizzes. We also have a Premium plan ('Margdarshak Pro') which unlocks advanced AI features, personalized doubt solving, and mock tests."
    },
    {
      question: "What if I get stuck on a specific question?",
      answer: "You can use our 'Ask Doubts' feature. Just snap a photo of the question or type it in, and our AI (or a human expert, depending on your plan) will provide a step-by-step explanation within minutes."
    },
    {
      question: "Can I use Margdarshak on my mobile phone?",
      answer: "Yes, our platform is fully responsive and works seamlessly on smartphones and tablets, so you can learn on the go."
    }
  ]

  return (
    <section id="faq" className="py-24 bg-slate-950 relative border-t border-slate-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Frequently Asked <span className="text-purple-500">Questions</span>
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to know before you start.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-800">
                <AccordionTrigger className="text-white hover:text-purple-400 text-lg py-6">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">Still have questions?</p>
            <Link href="/support">
                <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                    <MessageCircle className="h-4 w-4" /> Contact Support
                </Button>
            </Link>
        </div>
      </div>
    </section>
  )
}
