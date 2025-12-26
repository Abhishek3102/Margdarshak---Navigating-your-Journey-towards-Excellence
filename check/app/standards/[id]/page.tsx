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
                    {subjects.map((sub) => (
                        <Link key={sub.id} href={`/subjects/${sub.id}`}>
                            <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group h-full">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-purple-900/20 transition-colors">
                                        <Book className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <CardTitle className="text-xl text-slate-200 group-hover:text-white transition-colors">{sub.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500">Explore chapters, videos, and quizzes.</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    )
}
