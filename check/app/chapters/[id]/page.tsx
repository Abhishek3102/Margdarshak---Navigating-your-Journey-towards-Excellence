"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, Play, Clock, ChevronRight, Loader2, Plus, Upload, CheckCircle2, Film, Image as ImageIcon, X,  Maximize2, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { WatchPartyModal } from "@/components/watch-party-modal"
import axiosInstance from "@/lib/axios"

// Simple Modal Component
const VideoModal = ({ video, onClose }: { video: any, onClose: () => void }) => {
    if (!video) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                     <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>
                
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                    <video 
                        src={video.video_url} 
                        controls 
                        autoPlay 
                        className="w-full h-full"
                        poster={video.thumbnail_url}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                
                <div className="p-6 bg-slate-900">
                    <h2 className="text-2xl font-bold text-white mb-2">{video.title}</h2>
                    <p className="text-slate-400">{video.description || "No description available."}</p>
                </div>
            </div>
        </div>
    )
}

export default function ChapterPage() {
    const params = useParams()
    const id = params.id as string
    const { user } = useAuth()
    const [chapter, setChapter] = useState<any>(null)
    const [videos, setVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // Teacher Upload State
    const [isAddingMsg, setIsAddingMsg] = useState(false)
    const [newVideoTitle, setNewVideoTitle] = useState("")
    const [newVideoDesc, setNewVideoDesc] = useState("")
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
    const [selectedThumbFile, setSelectedThumbFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Player State
    const [playingVideo, setPlayingVideo] = useState<any>(null)
    const [watchPartyRoomId, setWatchPartyRoomId] = useState<string | null>(null)
    const [watchPartyVideo, setWatchPartyVideo] = useState<any>(null)

    const videoInputRef = useRef<HTMLInputElement>(null)
    const thumbInputRef = useRef<HTMLInputElement>(null)

    // Check for Watch Party Invite
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const partyId = searchParams.get('partyId')
        if (partyId && videos.length > 0) {
             // Fetch room details to know which video to play
             // For simplify, we assume the first video or we check the room API
             axiosInstance.get(`/watch-party/${partyId}`)
                .then(res => {
                    const data = res.data;
                    setWatchPartyRoomId(partyId)
                    setWatchPartyVideo({
                        video_url: data.video_url,
                        video_title: data.video_title,
                        // recreate basic video obj structure so modal works
                    })
                })
                .catch(err => toast.error("Watch Party expired or not found"))
        }
    }, [videos]) // Run when videos load so we have context if needed, though we fetch room data independently

    const startWatchParty = async (video: any) => {
        if (!user) {
            toast.error("Please login to watch")
            return
        }
        try {
            // Check if we are ALREADY in a party for this video (from URL)? 
            // Nay, new click = new session usually, unless we want to join existing?
            // For now, simple: Create new session for this user.
            const res = await axiosInstance.post("/watch-party/create", {
                video_url: video.video_url,
                video_title: video.title,
                host_id: user.id,
                host_name: user.name || "Viewer"
            })
            const data = res.data
            
            // Redirect to dedicated Study Group Page
            window.location.href = `/study-group/${data.room_id}`
            
        } catch (e) {
            toast.error("Failed to load video player")
        }
    }

    useEffect(() => {
        const fetchData = async () => {
             if (!id) return
             const { data: chap } = await supabase.from('chapters')
                .select('*, subjects(id, name, standards(id, name))')
                .eq('id', id)
                .single()
             setChapter(chap)
             fetchVideos()
        }
        fetchData()
    }, [id])

    const fetchVideos = async () => {
         const { data: vids } = await supabase
            .from('videos')
            .select('*')
            .eq('chapter_id', id)
            .order('sequence_order')
         setVideos(vids || [])
         setLoading(false)
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedVideoFile(e.target.files[0])
            if (!newVideoTitle) {
                const name = e.target.files[0].name.split('.')[0]
                setNewVideoTitle(name.replace(/_/g, ' ').replace(/-/g, ' '))
            }
        }
    }

    const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedThumbFile(e.target.files[0])
        }
    }

    const uploadFile = async (file: File, type: 'video' | 'image') => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('resource_type', type)

        // Point to the Generic /upload endpoint
        const res = await axiosInstance.post('/upload', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        
        return res.data
    }

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || user.role !== 'teacher') return
        if (!selectedVideoFile) {
            toast.error("Please select a video file")
            return
        }

        setIsSubmitting(true)
        setUploadProgress(true)
        
        try {
            // 1. Parallel Uploads
            const uploadPromises = [
                uploadFile(selectedVideoFile, 'video'),
            ]
            if (selectedThumbFile) {
                uploadPromises.push(uploadFile(selectedThumbFile, 'image'))
            }

            const results = await Promise.all(uploadPromises)
            const videoData = results[0]
            const thumbData = selectedThumbFile ? results[1] : null

            // 2. Prepare Data
            const videoUrl = videoData.url
            const duration = Math.round(Number(videoData.duration) || 0) 
            const thumbnailUrl = thumbData ? thumbData.url : videoUrl.replace(/\.(mp4|mov|avi)$/i, '.jpg') 

            const nextOrder = videos.length > 0 ? Math.max(...videos.map(v => v.sequence_order)) + 1 : 1

            // 3. Insert into Supabase with ROBUST FALLBACK
            
            // Attempt 1: Full Fields
            const { error: fullError } = await supabase.from('videos').insert({
                chapter_id: id,
                title: newVideoTitle,
                description: newVideoDesc,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                duration_seconds: duration,
                sequence_order: nextOrder,
                concept_tags: ['Lecture'] 
            })

            if (fullError) {
                console.warn("Full insert failed, attempting safe insert. Error:", JSON.stringify(fullError))
                
                // Attempt 2: Safe/Legacy Fields
                const { error: safeError } = await supabase.from('videos').insert({
                    chapter_id: id,
                    title: newVideoTitle,
                    video_url: videoUrl,
                    duration_seconds: duration,
                    sequence_order: nextOrder,
                    concept_tags: ['Lecture'] // Assuming concept_tags exists, if not remove this too
                })

                if (safeError) {
                    console.error("Safe Insert Failed:", JSON.stringify(safeError))
                    throw safeError
                } else {
                    toast.warning("Video saved, but description/thumbnail could not be stored (Database limit).")
                }
            } else {
                toast.success("Lesson published successfully!")
            }

            // Reset Form (Common Success)
            setNewVideoTitle("")
            setNewVideoDesc("")
            setSelectedVideoFile(null)
            setSelectedThumbFile(null)
            if (videoInputRef.current) videoInputRef.current.value = ""
            if (thumbInputRef.current) thumbInputRef.current.value = ""
            setIsAddingMsg(false)
            fetchVideos() 

        } catch (error: any) {
            console.error("Error adding video:", JSON.stringify(error))
            const msg = error.message || error.details || "Unknown Database Error"
            toast.error(`Error: ${msg}`)
        } finally {
            setIsSubmitting(false)
            setUploadProgress(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            
            {/* Unified Watch Party Player */}
            {watchPartyRoomId && watchPartyVideo && (
                <WatchPartyModal 
                    roomId={watchPartyRoomId} 
                    initialData={watchPartyVideo} 
                    onClose={() => {
                        setWatchPartyRoomId(null)
                        setWatchPartyVideo(null)
                        window.history.pushState({}, "", window.location.pathname) // Clear URL
                    }} 
                />
            )}

            <div className="container mx-auto px-4 pt-24 pb-12">
                 {/* Breadcrumb ... */}
                <div className="flex items-center text-sm text-slate-400 mb-6 flex-wrap">
                    <Link href="/dashboard">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span>{chapter?.title}</span>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-white">{chapter?.title}</h1>
                        <p className="text-slate-400">{chapter?.description}</p>
                    </div>
                    {user?.role === 'teacher' && (
                         <Button onClick={() => setIsAddingMsg(!isAddingMsg)} className={`${isAddingMsg ? 'bg-red-900/50 text-red-200' : 'bg-purple-600'} transition-all`}>
                            {isAddingMsg ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} 
                            {isAddingMsg ? "Cancel" : "Add Lesson"}
                         </Button>
                    )}
                </div>

                {/* Upload Form */}
                {isAddingMsg && user?.role === 'teacher' && (
                    <Card className="mb-8 border-purple-500/30 bg-slate-900/50 animate-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle className="flex items-center text-purple-400"><Upload className="w-5 h-5 mr-2" /> Upload New Lesson</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddVideo} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input 
                                                value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} 
                                                placeholder="Lesson Title" required className="bg-slate-950 border-slate-700" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea 
                                                value={newVideoDesc} onChange={(e) => setNewVideoDesc(e.target.value)} 
                                                placeholder="What is this lesson about?" className="bg-slate-950 border-slate-700 min-h-[100px]" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Video File</Label>
                                            <div className="flex gap-2 items-center p-3 border border-slate-700 rounded-md bg-slate-950/50 hover:bg-slate-950 transition-colors cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                                                <div className="bg-purple-900/30 p-2 rounded text-purple-400"><Film className="w-5 h-5" /></div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-medium truncate">{selectedVideoFile ? selectedVideoFile.name : "Select Video (MP4)"}</p>
                                                    <p className="text-xs text-slate-500">{selectedVideoFile ? `${(selectedVideoFile.size / (1024*1024)).toFixed(1)} MB` : "Max 100MB recomm."}</p>
                                                </div>
                                                <Button type="button" size="sm" variant="ghost">Browse</Button>
                                            </div>
                                            <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoChange} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Thumbnail (Optional)</Label>
                                            <div className="flex gap-2 items-center p-3 border border-slate-700 rounded-md bg-slate-950/50 hover:bg-slate-950 transition-colors cursor-pointer" onClick={() => thumbInputRef.current?.click()}>
                                                <div className="bg-emerald-900/30 p-2 rounded text-emerald-400"><ImageIcon className="w-5 h-5" /></div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-medium truncate">{selectedThumbFile ? selectedThumbFile.name : "Select Cover Image"}</p>
                                                </div>
                                                <Button type="button" size="sm" variant="ghost">Browse</Button>
                                            </div>
                                            <input type="file" ref={thumbInputRef} accept="image/*" className="hidden" onChange={handleThumbChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <Button type="submit" disabled={isSubmitting || !selectedVideoFile} className="bg-purple-600 hover:bg-purple-500 w-full md:w-auto">
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
                                        ) : (
                                            <><Upload className="w-4 h-4 mr-2" /> Publish Lesson</>
                                        )}
                                    </Button>
                                    {uploadProgress && isSubmitting && <p className="text-xs text-center mt-2 text-slate-500 w-full md:w-auto md:ml-4 flex items-center">Large files make take a few minutes...</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Videos Grid */}
                <div className="grid gap-4">
                    {videos.map((vid) => (
                        <Card key={vid.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all group">
                            <CardContent className="p-0 flex flex-col md:flex-row h-full md:h-40">
                                {/* Thumbnail */}
                                <div className="relative w-full md:w-72 h-40 md:h-full bg-black flex-shrink-0 cursor-pointer overflow-hidden" onClick={() => setPlayingVideo(vid)}>
                                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all bg-white z-10"></div>
                                    <img 
                                        src={vid.thumbnail_url || vid.video_url?.replace(/\.(mp4|mov|avi)$/i, '.jpg') || "/placeholder-video.jpg"} 
                                        alt={vid.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' }} // Fallback
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-white fill-current" />
                                        </div>
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-xs text-white rounded font-mono z-20">
                                        {vid.duration_seconds ? `${Math.floor(vid.duration_seconds/60)}:${String(Math.floor(vid.duration_seconds%60)).padStart(2,'0')}` : "00:00"}
                                    </span>
                                </div>
                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors cursor-pointer" onClick={() => setPlayingVideo(vid)}>{vid.title}</h3>
                                            <span className="text-xs text-slate-500 font-mono">#{vid.sequence_order}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2">{vid.description || "Watch this video to understand the concept better."}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white" onClick={() => setPlayingVideo(vid)}>
                                            <Play className="w-4 h-4 mr-2" /> Watch Now
                                        </Button>
                                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => startWatchParty(vid)}>
                                            <Users className="w-4 h-4 mr-2" /> Study Group
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {videos.length === 0 && !loading && (
                        <div className="text-center py-20 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                             <p className="text-slate-500">No videos in this chapter yet.</p>
                             {user?.role === 'teacher' && <p className="text-sm text-slate-600 mt-2">Click "Add Lesson" to start.</p>}
                        </div>
                    )}
                </div>
            </div>
            
             {/* Normal Video Modal */}
             {playingVideo && <VideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />}
        </main>
    )
}
