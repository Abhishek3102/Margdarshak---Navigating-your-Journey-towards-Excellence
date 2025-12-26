"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Play, Clock, FileText, ChevronRight, Loader2 } from "lucide-react"

export default function ChapterPage() {
    const params = useParams()
    const id = params.id as string
    const [chapter, setChapter] = useState<any>(null)
    const [videos, setVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
             if (!id) return

             // Fetch Chapter & Parent Subject
             const { data: chap } = await supabase.from('chapters')
                .select('*, subjects(id, name, standards(id, name))')
                .eq('id', id)
                .single()
             setChapter(chap)

             // Fetch Videos
             const { data: vids } = await supabase
                .from('videos')
                .select('*')
                .eq('chapter_id', id)
                .order('sequence_order')
             
             setVideos(vids || [])
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
                <div className="flex items-center text-sm text-slate-400 mb-6 flex-wrap">
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href={`/standards/${chapter?.subjects?.standards?.id}`} className="hover:text-white transition-colors">{chapter?.subjects?.standards?.name}</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href={`/subjects/${chapter?.subjects?.id}`} className="hover:text-white transition-colors">{chapter?.subjects?.name}</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-white font-medium">{chapter?.title}</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-white">{chapter?.title}</h1>
                    <p className="text-slate-400 max-w-2xl">{chapter?.description || "Master this concept through curated video lessons and practice materials."}</p>
                </div>

                <div className="space-y-6">
                    {/* Video List */}
                    <div className="grid grid-cols-1 gap-4">
                        {videos.length > 0 ? videos.map((video) => (
                             <Card key={video.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    {/* Thumbnail Placeholder */}
                                    <div className="w-full md:w-64 h-36 bg-slate-800 flex items-center justify-center flex-shrink-0 relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                                        <Play className="w-10 h-10 text-white opacity-80 group-hover:scale-110 transition-transform" />
                                        <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-1 rounded text-white">
                                            {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                                        </span>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {video.concept_tags?.map((tag: string) => (
                                                    <span key={tag} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <Button className="grad-btn text-white" size="sm" asChild>
                                                <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                                                    <Play className="w-4 h-4 mr-2" /> Watch Lesson
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                        )) : (
                            <div className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-xl">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                                    <Clock className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Content Coming Soon</h3>
                                <p className="text-slate-400">Your teacher hasn't uploaded video lessons for this chapter yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
