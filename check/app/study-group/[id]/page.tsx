"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { WatchPartyModal } from "@/components/watch-party-modal"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function StudyGroupSessionPage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params.id as string

    const [loading, setLoading] = useState(true)
    const [roomData, setRoomData] = useState<any>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/watch-party/${roomId}`)
                if (!res.ok) throw new Error("Room not found")
                
                const data = await res.json()
                setRoomData(data)
            } catch (e) {
                console.error(e)
                setError(true)
                toast.error("Invalid Room ID or Session Expired")
            } finally {
                setLoading(false)
            }
        }

        if (roomId) fetchRoom()
    }, [roomId])

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-zinc-500">Connecting to Study Group...</p>
                </div>
            </main>
        )
    }

    if (error || !roomData) {
         return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                     <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">Session Not Found</h1>
                        <p className="text-zinc-400">The study group code is invalid or the session has ended.</p>
                        <button onClick={() => router.push('/study-group')} className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                            Try another code
                        </button>
                     </div>
                </div>
            </main>
        )
    }

    // Render the modal-like component directly as the page content
    // We override 'onClose' to go back to the join page
    return (
        <main className="min-h-screen bg-black text-white">
            <WatchPartyModal 
                roomId={roomId} 
                initialData={roomData} 
                onClose={() => router.push('/dashboard')} 
            />
        </main>
    )
}
