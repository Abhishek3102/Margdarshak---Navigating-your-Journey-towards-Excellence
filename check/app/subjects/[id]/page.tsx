"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, PlayCircle, Loader2, ChevronRight } from "lucide-react"

export default function SubjectPage() {
    const params = useParams()
    const id = params.id as string
    const [subject, setSubject] = useState<any>(null)
    const [chapters, setChapters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
             if (!id) return

             // Fetch Subject & Parent Standard
             const { data: sub } = await supabase.from('subjects').select('*, standards(id, name)').eq('id', id).single()
             setSubject(sub)

             // Fetch Chapters
             const { data: chaps } = await supabase
                .from('chapters')
                .select('*')
                .eq('subject_id', id)
                .order('sequence_order')
             
             setChapters(chaps || [])
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
                <div className="flex items-center text-sm text-slate-400 mb-6">
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href={`/standards/${subject?.standards?.id}`} className="hover:text-white transition-colors">{subject?.standards?.name}</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-white font-medium">{subject?.name}</span>
                </div>

                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-white">{subject?.name}</h1>
                    <p className="text-slate-400">Master these topics sequentially.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 max-w-4xl">
                    {chapters.map((chap, index) => (
                        <Link key={chap.id} href={`/chapters/${chap.id}`}>
                            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                            {chap.sequence_order || index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-200 group-hover:text-white">{chap.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">Foundational Concept</p>
                                        </div>
                                    </div>
                                    <PlayCircle className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    
                    {chapters.length === 0 && (
                        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                            No chapters found for this subject yet.
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    )
}
