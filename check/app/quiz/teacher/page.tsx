"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function TeacherDashboard() {
  const router = useRouter()
  
  const classes = [
    { id: "8", label: "Class 8", description: "View progress for 8th Grade students" },
    { id: "9", label: "Class 9", description: "View progress for 9th Grade students" },
    { id: "10", label: "Class 10", description: "View progress for 10th Grade students" },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Teacher Diagnostic Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Select a class to view detailed student performance reports and analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => router.push(`/quiz/teacher/${cls.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                      <GraduationCap className="w-6 h-6 text-purple-400" />
                    </div>
                    {cls.label}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {cls.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                       <Users className="w-4 h-4" />
                       View Students
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
