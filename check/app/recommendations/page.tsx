"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, Lock, Unlock, CheckCircle, Star } from "lucide-react"
import { curriculumAPI } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function MasteryPathsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStandard, setSelectedStandard] = useState<string>("")

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true)
        const response = await curriculumAPI.getStructure()
        // Response format: { data: [ { name: "Class 8", subjects: [...] } ] }
        const standards = response.data || []
        setData(standards)
        
        if (standards.length > 0) {
            setSelectedStandard(standards[0].name)
        }
      } catch (error) {
        console.error("Failed to fetch curriculum:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurriculum()
  }, [])

  // Mock function to determine node status for demo
  const getNodeStatus = (idx: number) => {
      if (idx < 2) return "mastered";
      if (idx === 2) return "unlocked";
      return "locked";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />

      <section className="pt-32 pb-16 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
          <div className="container mx-auto px-4 relative">
             <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Mastery Paths
                </h1>
                <p className="text-lg text-slate-400">Your personalized knowledge tree. Unlock nodes to progress.</p>
             </div>

             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    No paths available.
                </div>
            ) : (
                <Tabs value={selectedStandard} onValueChange={setSelectedStandard} className="w-full space-y-12">
                   <div className="flex justify-center">
                        <TabsList className="bg-slate-900/80 border border-slate-800 p-1 h-auto rounded-full">
                            {data.map((std: any) => (
                                <TabsTrigger 
                                    key={std.id} 
                                    value={std.name}
                                    className="px-6 py-2 rounded-full data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 transition-all font-medium"
                                >
                                    {std.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {data.map((std: any) => (
                        <TabsContent key={std.id} value={std.name} className="animate-in fade-in duration-500">
                            <div className="grid gap-12">
                                {std.subjects.map((subj: any) => (
                                    <div key={subj.id} className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-8 backdrop-blur-sm">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Star className="w-6 h-6 fill-current" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{subj.name}</h2>
                                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                                    <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">3 Mastered</Badge>
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">1 In Progress</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skill Tree Vis */}
                                        <div className="relative">
                                            {/* Connecting Line */}
                                            <div className="absolute left-6 top-6 bottom-6 w-1 bg-slate-800 rounded-full"></div>
                                            
                                            <div className="space-y-8 relative">
                                                {subj.chapters.map((chap: any, idx: number) => {
                                                    const status = getNodeStatus(idx);
                                                    return (
                                                        <div key={chap.id} className="flex items-start gap-6 group">
                                                            {/* Node Icon */}
                                                            <div className={`
                                                                relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 transition-all duration-300
                                                                ${status === 'mastered' ? 'bg-slate-950 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}
                                                                ${status === 'unlocked' ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110' : ''}
                                                                ${status === 'locked' ? 'bg-slate-900 border-slate-700 text-slate-600 grayscale' : ''}
                                                            `}>
                                                                {status === 'mastered' && <CheckCircle className="w-5 h-5" />}
                                                                {status === 'unlocked' && <Unlock className="w-5 h-5" />}
                                                                {status === 'locked' && <Lock className="w-5 h-5" />}
                                                            </div>

                                                            {/* Content Card */}
                                                            <Card className={`
                                                                flex-1 border-0 transition-all duration-300
                                                                ${status === 'mastered' ? 'bg-slate-900/50 opacity-60' : ''}
                                                                ${status === 'unlocked' ? 'bg-slate-800 border-l-4 border-l-indigo-500 shadow-lg translate-x-2' : 'bg-slate-900/40'}
                                                                ${status === 'locked' ? 'opacity-40' : ''}
                                                            `}>
                                                                <div className="p-4 flex items-center justify-between">
                                                                    <div>
                                                                        <h3 className={`font-semibold text-lg ${status === 'unlocked' ? 'text-white' : 'text-slate-300'}`}>
                                                                            {chap.title}
                                                                        </h3>
                                                                        <p className="text-sm text-slate-500 mt-1">
                                                                            {chap.videos?.length || 0} Lessons • {status === 'unlocked' ? 'Ready to Start' : status === 'mastered' ? 'Completed' : 'Prerequisite required'}
                                                                        </p>
                                                                    </div>
                                                                    {status === 'unlocked' && (
                                                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                                                            Start
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </Card>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
             )}
          </div>
      </section>

      <Footer />
    </main>
  )
}
