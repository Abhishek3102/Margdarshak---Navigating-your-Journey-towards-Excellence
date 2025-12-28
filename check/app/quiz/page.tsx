
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Clock, Target, Trophy } from "lucide-react"
import Link from "next/link"

export default function QuizLandingPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
          Diagnostic Assessment
        </h1>
        <p className="text-xl text-muted-foreground">
          Let's discover your hidden strengths and identify areas for growth.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader>
            <Brain className="w-12 h-12 text-primary mb-2" />
            <CardTitle>Personalized Analysis</CardTitle>
            <CardDescription>
              Questions tailored to your previous academic standard to gauge your foundation.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader>
            <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>
              Get a detailed breakdown of your performance with actionable AI feedback.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader>
            <Target className="w-12 h-12 text-green-500 mb-2" />
            <CardTitle>Comprehensive Coverage</CardTitle>
            <CardDescription>
              Maths, Science, English, and History - all in one go.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader>
            <Clock className="w-12 h-12 text-blue-500 mb-2" />
            <CardTitle>~20 Minutes</CardTitle>
            <CardDescription>
              30 Questions. No time limit, but we track your speed for analysis.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/quiz/test">
          <Button size="lg" className="text-lg px-12 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            Start Diagnostic Test
          </Button>
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          Ready? Make sure you have a quiet environment.
        </p>
      </div>
    </div>
  )
}
