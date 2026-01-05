"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Book, Loader2 } from "lucide-react"

export default function StandardPage() {
    const params = useParams()
    const id = params.id as string
    const [standard, setStandard] = useState<any>(null)
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return

            // Fetch Standard Details
            const { data: std } = await supabase.from('standards').select('*').eq('id', id).single()
            setStandard(std)

            // Fetch Subjects
            const { data: subs } = await supabase.from('subjects').select('*').eq('standard_id', id).order('name')
            setSubjects(subs || [])
            
            setLoading(false)
        }
        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            
            <div className="container mx-auto px-4 pt-24 pb-12">
                <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                            {standard?.name}
                        </span> Curriculum
                    </h1>
                    <p className="text-slate-400">Select a subject to view its chapters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub) => {
                        // Helper to get image based on subject name
                        const getSubjectImage = (name: string) => {
                            const n = name.toLowerCase();
                            
                            // Specific Math Streams
                            if (n.includes('math') && (n.includes('1') || n.includes('algebra'))) return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800"; // Algebra/Formulas
                            if (n.includes('math') && (n.includes('2') || n.includes('geometry'))) return "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800"; // Numerical/Calculation (Calculator/Writing)
                            if (n.includes('math')) return "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800"; // General Math

                            // Specific Science Streams
                            if (n.includes('science') && (n.includes('1') || n.includes('phys') || n.includes('chem'))) return "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800"; // Physics/Chem
                            if (n.includes('science') && (n.includes('2') || n.includes('bio'))) return "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800"; // Biology/DNA
                            if (n.includes('science')) return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800"; // General Science (Lab)

                            // Humanities & Others
                            if (n.includes('english') || n.includes('grammar') || n.includes('lit')) return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800";
                            if (n.includes('history') || n.includes('social') || n.includes('geo')) return "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800";
                            if (n.includes('computer') || n.includes('tech') || n.includes('code')) return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800";
                            
                            // Default
                            return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800";
                        }

                        // Helper for Description
                        const getSubjectDescription = (name: string) => {
                             const n = name.toLowerCase();
                             if (n.includes('math') && n.includes('1')) return "Master algebraic expressions, quadratic equations, and mathematical logic with deeper conceptual clarity.";
                             if (n.includes('math') && n.includes('2')) return "Explore complex numerical calculations, geometric theorems, and advanced problem-solving techniques.";
                             if (n.includes('science') && n.includes('1')) return "Dive into the laws of physics, chemical reactions, and the fundamental properties of matter.";
                             if (n.includes('science') && n.includes('2')) return "Understand biological systems, genetics, evolution, and the intricate wonders of living organisms.";
                             if (n.includes('english')) return "Enhance your grammar, literature analysis, and creative writing skills through structured lessons.";
                             if (n.includes('history')) return "Journey through time to understand ancient civilizations, revolutions, and modern world events.";
                             return "Comprehensive curriculum featuring interactive video lessons, notes, and adaptive practice quizzes.";
                        }

                        return (
                        <Link key={sub.id} href={`/subjects/${sub.id}`}>
                            <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group h-[340px] overflow-hidden flex flex-col">
                                <div className="h-56 w-full relative overflow-hidden">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                     <img 
                                        src={getSubjectImage(sub.name)} 
                                        alt={sub.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90" />
                                     <div className="absolute bottom-3 left-4">
                                         <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors shadow-none">{sub.name}</h3>
                                     </div>
                                </div>
                                <CardContent className="px-4 py-3 flex-grow flex flex-col justify-between bg-slate-900">
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                        {getSubjectDescription(sub.name)}
                                    </p>
                                    <div className="flex items-center text-[10px] text-purple-400 font-medium uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                                        View Curriculum <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )})}
                </div>
            </div>

            <Footer />
        </main>
    )
}
