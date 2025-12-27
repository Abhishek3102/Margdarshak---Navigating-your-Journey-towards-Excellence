
"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Play, Pause, MessageSquare, Send, Users, Wifi, Mic, MicOff } from "lucide-react"
import { toast } from "sonner"
import Peer from "simple-peer"
// Polyfill for simple-peer in browser
if (typeof window !== 'undefined') {
    window.process = window.process || { env: {} } as any;
    window.Buffer = window.Buffer || require('buffer').Buffer;
}

interface WatchPartyModalProps {
    roomId: string
    initialData: any // Video Title, URL, etc.
    onClose: () => void
}

interface ChatMessage {
    type: "CHAT_MESSAGE" | "USER_JOINED" | "USER_LEFT" | "SYSTEM"
    text?: string
    userId?: string
    username?: string
    timestamp: string
}

export function WatchPartyModal({ roomId, initialData, onClose }: WatchPartyModalProps) {
    const { user } = useAuth()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [viewerCount, setViewerCount] = useState(1)
    
    // WebSocket
    const wsRef = useRef<WebSocket | null>(null)
    const [connected, setConnected] = useState(false)
    
    // Antigravity: Prevent infinite loop of syncs (Local Event vs Remote Event)
    const remoteUpdate = useRef(false)

    useEffect(() => {
        if (!user || !roomId) return

        // Connect to WS
        const wsUrl = `ws://127.0.0.1:8000/api/watch-party/ws/${roomId}/${user.id}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            console.log("[WatchParty] Connected")
            setConnected(true)
            toast.success("Connected to Watch Party!")
            
            // Ask for current state just in case (optional, good for late joiners)
            ws.send(JSON.stringify({ type: "REQUEST_SYNC", targetUserId: user.id }))
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                handleMessage(msg)
            } catch (e) {
                console.error("Parse error", e)
            }
        }

        ws.onclose = () => {
            console.log("[WatchParty] Disconnected")
            setConnected(false)
            toast.error("Lost connection to party")
        }

        return () => {
            ws.close()
        }
    }, [roomId, user])

    const handleMessage = (msg: any) => {
        console.log("[WatchParty] Event:", msg.type, msg)
        
        switch (msg.type) {
            case "USER_JOINED":
                setMessages(prev => [...prev, { type: "USER_JOINED", username: "New User", timestamp: new Date().toISOString() }])
                setViewerCount(prev => prev + 1)
                break;
            
            case "USER_LEFT":
                setMessages(prev => [...prev, { type: "USER_LEFT", username: "User", timestamp: new Date().toISOString() }])
                setViewerCount(prev => Math.max(1, prev - 1))
                break;

            case "CHAT_MESSAGE":
                // Ignore own messages (handled by optimistic update)
                if (msg.userId === user?.id) return;

                setMessages(prev => [...prev, { 
                    type: "CHAT_MESSAGE", 
                    username: msg.username, 
                    text: msg.text, 
                    userId: msg.userId,
                    timestamp: new Date().toISOString() 
                }])
                break;

            // --- SYNC EVENTS ---
            case "PLAY":
                if (videoRef.current) {
                    const drift = Math.abs(videoRef.current.currentTime - msg.currentTime)
                    if (drift > 1) { // 1s threshold
                         videoRef.current.currentTime = msg.currentTime
                    }
                    if (videoRef.current.paused) {
                        remoteUpdate.current = true
                        videoRef.current.play().catch(() => {})
                        setIsPlaying(true)
                        // Reset flag after a delay to cover the 'play' event firing
                        setTimeout(() => { remoteUpdate.current = false }, 1000) 
                    }
                }
                break;
            
            case "PAUSE":
                 if (videoRef.current) {
                    const drift = Math.abs(videoRef.current.currentTime - msg.currentTime)
                    if (drift > 1) { 
                        videoRef.current.currentTime = msg.currentTime
                    }
                    if (!videoRef.current.paused) {
                        remoteUpdate.current = true
                        videoRef.current.pause()
                        setIsPlaying(false)
                        setTimeout(() => { remoteUpdate.current = false }, 1000)
                    }
                }
                break;

            case "SEEK":
                 if (videoRef.current) {
                    // Always seek if explicit seek event
                    remoteUpdate.current = true
                    videoRef.current.currentTime = msg.currentTime
                    setTimeout(() => { remoteUpdate.current = false }, 1000)
                }
                break;
                
            case "REQUEST_SYNC":
                if (videoRef.current && !videoRef.current.paused) {
                     wsRef.current?.send(JSON.stringify({
                        type: "SYNC_STATE",
                        currentTime: videoRef.current.currentTime,
                        isPlaying: true,
                        targetUserId: msg.senderId
                    }))
                }
                break;
            
            case "SYNC_STATE":
                if (videoRef.current) {
                    const drift = Math.abs(videoRef.current.currentTime - msg.currentTime)
                    if (drift > 1) videoRef.current.currentTime = msg.currentTime
                    
                    if (msg.isPlaying && videoRef.current.paused) {
                        remoteUpdate.current = true
                        videoRef.current.play().catch(() => {})
                        setIsPlaying(true)
                        setTimeout(() => { remoteUpdate.current = false }, 1000)
                    }
                }
                break;

            // --- VOICE EVENTS ---
            case "VOICE_JOIN":
                if (stream && msg.userId !== user?.id) {
                     // New user joined voice, I should offer
                     const peer = createPeer(msg.userId, stream)
                     peersRef.current.push({ peerID: msg.userId, peer })
                     setPeers(prev => [...prev, peer])
                }
                break;

            case "VOICE_OFFER":
                if (stream && msg.to === user?.id) {
                    const peer = addPeer(msg.offer, msg.from, stream)
                    peersRef.current.push({ peerID: msg.from, peer })
                    setPeers(prev => [...prev, peer])
                }
                break;

            case "VOICE_ANSWER":
                if (stream && msg.to === user?.id) {
                     const item = peersRef.current.find(p => p.peerID === msg.from)
                     if (item) item.peer.signal(msg.answer)
                }
                break;
        }
    }

    // --- UI HANDLERS ---
    const sendChat = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputText.trim() || !connected) return
        
        const msg = {
            type: "CHAT_MESSAGE",
            text: inputText,
            username: user?.name || "Student",
            userId: user?.id
        }
        wsRef.current?.send(JSON.stringify(msg))
        // Optimistic Update
        setMessages(prev => [...prev, { 
            type: "CHAT_MESSAGE", 
            username: msg.username, 
            text: msg.text, 
            userId: msg.userId,
            timestamp: new Date().toISOString() 
        }])
        setInputText("")
    }

    // --- VIDEO EVENT LISTENERS ---
    const onPlay = () => {
        if (remoteUpdate.current || !connected) {
             // console.log("Ignoring remote play")
             return
        }
        console.log("Local Play Emit")
        wsRef.current?.send(JSON.stringify({ type: "PLAY", currentTime: videoRef.current?.currentTime || 0, userId: user?.id }))
    }

    const onPause = () => {
        if (remoteUpdate.current || !connected) return
        console.log("Local Pause Emit")
        wsRef.current?.send(JSON.stringify({ type: "PAUSE", currentTime: videoRef.current?.currentTime || 0, userId: user?.id }))
    }

    const onSeeked = () => {
        if (remoteUpdate.current || !connected) return
        console.log("Local Seek Emit")
        wsRef.current?.send(JSON.stringify({ type: "SEEK", currentTime: videoRef.current?.currentTime || 0, userId: user?.id }))
    }

    const [linkBtnText, setLinkBtnText] = useState("Copy Link")
    const [codeBtnText, setCodeBtnText] = useState("Copy Code")

    const copyLink = () => {
        // Use current URL if on dedicated page, or construct it
        const url = window.location.href.includes('partyId') || window.location.href.includes('study-group') 
            ? window.location.href 
            : `${window.location.origin}/study-group/${roomId}`
            
        navigator.clipboard.writeText(url)
        setLinkBtnText("Copied!")
        toast.success("Link copied to clipboard")
        setTimeout(() => setLinkBtnText("Copy Link"), 2000)
    }

    const copyCode = () => {
        navigator.clipboard.writeText(roomId)
        setCodeBtnText("Copied!")
        toast.success("Code copied to clipboard")
        setTimeout(() => setCodeBtnText("Copy Code"), 2000)
    }

    // Voice Chat State
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [peers, setPeers] = useState<Peer.Instance[]>([])
    const [isMuted, setIsMuted] = useState(false)
    const peersRef = useRef<{peerID: string, peer: Peer.Instance}[]>([])

    const joinVoiceChat = async () => {
        if (!connected || !user) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            setStream(stream)
            setIsMuted(false)
            toast.success("Joined Voice Chat")

            // Tell others I'm here for voice
            wsRef.current?.send(JSON.stringify({ type: "VOICE_JOIN", userId: user.id }))

        } catch (error) {
            console.error("Voice chat error:", error)
            toast.error("Could not access microphone")
        }
    }

    const leaveVoice = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
            peersRef.current.forEach(p => p.peer.destroy())
            peersRef.current = []
            setPeers([])
        }
    }

    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsMuted(!audioTrack.enabled)
            }
        }
    }

    const createPeer = (userToSignal: string, stream: MediaStream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        })

        peer.on("signal", (signal: any) => {
             wsRef.current?.send(JSON.stringify({ type: "VOICE_OFFER", to: userToSignal, offer: signal, from: user?.id }))
        })

        peer.on("stream", (remoteStream: MediaStream) => {
             const audio = document.createElement('audio')
             audio.srcObject = remoteStream
             audio.play()
        })

        return peer
    }

    const addPeer = (incomingSignal: any, callerID: string, stream: MediaStream) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", (signal: any) => {
            wsRef.current?.send(JSON.stringify({ type: "VOICE_ANSWER", to: callerID, answer: signal, from: user?.id }))
        })

        peer.on("stream", (remoteStream: MediaStream) => {
            const audio = document.createElement('audio')
            audio.srcObject = remoteStream
            audio.play()
        })

        peer.signal(incomingSignal)

        return peer
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in duration-300">
            {/* TOP BAR - Global Header for Party */}
            <div className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full" onClick={() => { leaveVoice(); onClose(); }}>
                        <X className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">Watch Party</h1>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1 font-mono">
                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded">ID: {roomId}</span>
                            <span>Host: {initialData.host_name || "Unknown"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     {!stream ? (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 gap-2 font-medium" onClick={joinVoiceChat}>
                            <Wifi className="w-4 h-4" /> Join Voice
                        </Button>
                     ) : (
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-full p-1 pr-4 border border-zinc-700">
                             <button onClick={toggleMute} className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
                                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                             </button>
                             <span className="text-sm text-green-400 font-medium animate-pulse">Connected</span>
                             <button onClick={leaveVoice} className="text-xs text-zinc-400 hover:text-white ml-2 underline">Leave</button>
                        </div>
                     )}
                    
                    <div className="h-6 w-px bg-zinc-800 mx-1"></div>

                    <Button size="sm" variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 min-w-[100px]" onClick={copyLink}>
                         <Users className="w-4 h-4" /> {linkBtnText}
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-2 min-w-[100px]" onClick={copyCode}>
                         <Send className="w-4 h-4" /> {codeBtnText}
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT: Video Player */}
                <div className="flex-1 flex flex-col bg-black relative group justify-center items-center">
                    {/* Overlay Title (Only visible on hover over video) */}
                    <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <div className="flex gap-4 items-center">
                            <h2 className="text-white font-bold text-xl drop-shadow-md">{initialData.video_title || initialData.title}</h2>
                         </div>
                    </div>

                    {/* Unmute Overlay */}
                    {videoRef.current?.muted && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                             <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold flex items-center gap-3 animate-pulse pointer-events-auto cursor-pointer border border-white/20"
                                  onClick={() => {
                                      if (videoRef.current) {
                                          videoRef.current.muted = false;
                                          videoRef.current.volume = 1;
                                      }
                                  }}
                             >
                                 <MicOff className="w-5 h-5" />
                                 Click to Unmute
                             </div>
                        </div>
                    )}

                    <div className="w-full h-full max-h-full flex items-center justify-center bg-black/20">
                        <video 
                            ref={videoRef}
                            src={initialData.video_url?.replace("http://", "https://")} 
                            className="max-h-full max-w-full aspect-video shadow-2xl"
                            controls
                            playsInline
                            crossOrigin="anonymous"
                            // muted={false} // React doesn't like this, use defaultMuted={false} or just omit
                            onPlay={onPlay}
                            onPause={onPause}
                            onSeeked={onSeeked}
                            onVolumeChange={() => {
                                // Force re-render to update overlay
                                setViewerCount(prev => prev) // Hacky trigger, better to use separate state but simple for now
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT: Chat Panel */}
                <div className="w-96 border-l border-zinc-800 flex flex-col bg-zinc-950">
                    {/* Header */}
                    <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900/50">
                        <div className="flex items-center gap-2 text-zinc-200 font-semibold text-sm">
                            <MessageSquare className="w-4 h-4 text-purple-400" />
                            Live Chat
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            {viewerCount} Online
                        </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 bg-zinc-950/50">
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.userId === user?.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                                    {m.type === "CHAT_MESSAGE" ? (
                                        <>
                                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.userId === user?.id ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'}`}>
                                                {m.text}
                                            </div>
                                            <span className="text-[10px] text-zinc-600 mt-1 px-1">{m.username}</span>
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-[10px] text-zinc-700 uppercase tracking-wider py-1 font-medium bg-zinc-900/30 rounded my-1">
                                            {m.type === "USER_JOINED" ? `${m.username} message` : `${m.username} left`}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-2 opacity-50">
                                    <MessageSquare className="w-10 h-10" />
                                    <span className="text-sm">No messages yet</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <form onSubmit={sendChat} className="p-4 border-t border-zinc-800 bg-zinc-900">
                        <div className="relative">
                            <Input 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-purple-500 pr-10 rounded-full"
                            />
                            <Button type="submit" size="sm" className="absolute right-1 top-1 bg-purple-600 hover:bg-purple-700 h-8 w-8 rounded-full p-0 flex items-center justify-center">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
