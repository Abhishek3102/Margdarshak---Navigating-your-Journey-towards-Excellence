"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, Book, ChevronDown, MonitorPlay } from "lucide-react"
import { curriculumAPI } from "@/lib/api"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSearchParams } from "next/navigation"

export default function CoursesPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStandard, setSelectedStandard] = useState<string>("")
  const searchParams = useSearchParams()
  const urlClass = searchParams.get('class')

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true)
        const response = await curriculumAPI.getStructure()
        // Response format: { data: [ { name: "Class 8", subjects: [...] } ] }
        const standards = response.data || []
        setData(standards)
        
        if (standards.length > 0) {
            // If URL param exists and matches a standard, use it. Otherwise default to first.
            if (urlClass && standards.some((s: any) => s.name === urlClass)) {
                setSelectedStandard(urlClass)
            } else {
                setSelectedStandard(standards[0].name)
            }
        }
      } catch (error) {
        console.error("Failed to fetch curriculum:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurriculum()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />

      <section className="pt-32 pb-12 hero-bg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-950 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Academic Atlas
              </span>
            </h1>
            <p className="text-xl text-slate-400 font-medium">Explore the complete knowledge catalog required for your excellence.</p>
          </div>
        </div>
      </section>

      <section className="pb-20 min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-6xl">
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    No curriculum data available.
                </div>
            ) : (
                <Tabs value={selectedStandard} onValueChange={setSelectedStandard} className="w-full space-y-8">
                    <div className="flex justify-center">
                        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-auto rounded-full">
                            {data.map((std: any) => (
                                <TabsTrigger 
                                    key={std.id} 
                                    value={std.name}
                                    className="px-6 py-2 rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-medium transition-all"
                                >
                                    {std.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {data.map((std: any) => (
                        <TabsContent key={std.id} value={std.name} className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {std.subjects.map((subj: any) => (
                                    <div key={subj.id} className="flex flex-col h-full">
                                        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors h-full">
                                            <CardHeader className="pb-3 border-b border-slate-800/50">
                                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                                    <Book className="w-5 h-5 text-blue-400" />
                                                    {subj.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {subj.chapters?.length || 0} Chapters
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Accordion type="single" collapsible className="w-full">
                                                    {subj.chapters.map((chap: any, idx: number) => (
                                                        <AccordionItem key={chap.id} value={chap.id} className="border-slate-800 px-4">
                                                            <AccordionTrigger className="text-left py-3 text-slate-300 hover:text-white hover:no-underline">
                                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                                    <span className="text-slate-500 w-5 text-xs">#{idx + 1}</span>
                                                                    {chap.title}
                                                                </span>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="pl-7 pr-2 pb-3 space-y-2">
                                                                    {chap.videos.length > 0 ? (
                                                                        chap.videos.map((vid: any) => (
                                                                            <div key={vid.id} className="flex items-center gap-2 text-sm text-slate-400 py-1">
                                                                                <MonitorPlay className="w-3 h-3 text-emerald-500/70" />
                                                                                <span className="truncate">{vid.title}</span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-xs text-slate-600 italic">No topics listed yet</span>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </CardContent>
                                        </Card>
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
