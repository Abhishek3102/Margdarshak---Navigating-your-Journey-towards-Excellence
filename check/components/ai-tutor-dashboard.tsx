"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Loader2, Plus, MessageSquare, Mic, Paperclip, Image as ImageIcon, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  image_url?: string | null
}

interface Session {
    id: string
    title: string
    updated_at: string
}

export function AITutorDashboard({ userName }: { userName: string }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Fetch Sessions on Mount
  useEffect(() => {
    fetchSessions()
  }, [])
  
  // 2. Fetch Messages when Session Changes
  useEffect(() => {
    if (activeSessionId) {
        fetchMessages(activeSessionId)
    } else {
        setMessages([])
    }
  }, [activeSessionId])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchSessions = async () => {
      try {
          const res = await axiosInstance.get("/chat/sessions")
          setSessions(res.data)
          if (res.data.length > 0 && !activeSessionId) {
              setActiveSessionId(res.data[0].id)
          }
      } catch (e) {
          console.error("Failed to fetch sessions", e)
      }
  }

  const fetchMessages = async (sessionId: string) => {
      setIsLoading(true)
      try {
          const res = await axiosInstance.get(`/chat/sessions/${sessionId}`)
          setMessages(res.data)
      } catch (e) {
          console.error("Failed to fetch messages", e)
      } finally {
          setIsLoading(false)
      }
  }

  const createNewSession = async () => {
      // Just reset local state. Backend session is created on first message.
      setActiveSessionId(null)
      setMessages([])
  }

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation() // Prevent selecting the session
      if (!confirm("Are you sure you want to delete this chat?")) return
      
      try {
          await axiosInstance.delete(`/chat/sessions/${sessionId}`)
          setSessions(prev => prev.filter(s => s.id !== sessionId))
          if (activeSessionId === sessionId) {
              setActiveSessionId(null)
              setMessages([])
          }
      } catch (err) {
          console.error("Failed to delete session", err)
      }
  }

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return
    
    let currentSessionId = activeSessionId

    // 1. Create Session if needed (Wait for it!)
    if (!currentSessionId) {
        try {
            const res = await axiosInstance.post("/chat/sessions", { title: input.trim().slice(0, 30) || "New Chat" })
            setSessions(prev => [res.data, ...prev])
            setActiveSessionId(res.data.id)
            currentSessionId = res.data.id
        } catch (e) {
            console.error("Failed to create session", e)
            return
        }
    }

    // Optimistic Update
    const tempId = Date.now().toString()
    const userMsg: Message = { 
        id: tempId, 
        role: 'user', 
        content: input, 
        image_url: selectedImage ? URL.createObjectURL(selectedImage) : undefined 
    }
    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput("")
    setSelectedImage(null)
    setIsLoading(true)

    if (!currentSessionId) return // Should not happen due to logic above
    
    // Prepare FormData
    const formData = new FormData()
    formData.append("session_id", currentSessionId) // Use the guaranteed ID
    formData.append("message", currentInput)
    if (selectedImage) {
        formData.append("image", selectedImage)
    }

    try {
        const res = await axiosInstance.post("/chat/message", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        const aiMsg: Message = { 
            role: 'assistant', 
            content: res.data.response 
        }
        setMessages(prev => [...prev, aiMsg])
    } catch (error: any) {
        console.error("Chat Error", error)
        const errMsg = error.response?.status === 429 
            ? "⚠️ Daily image limit reached (4/4)." 
            : "❌ Failed to send message. Please try again."
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
    } finally {
        setIsLoading(false)
    }
  }

  // Voice Input (Web Speech API)
  const startListening = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          const recognition = new SpeechRecognition()
          recognition.onstart = () => setIsListening(true)
          recognition.onend = () => setIsListening(false)
          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript
              setInput(prev => prev + " " + transcript)
          }
          recognition.start()
      } else {
          alert("Voice input not supported in this browser.")
      }
  }

  return (
    <div className="flex h-[80vh] w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

      {/* Sidebar */}
      <motion.div 
        initial={{ width: 250 }}
        animate={{ width: isSidebarOpen ? 250 : 0 }}
        className="bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden"
      >
          <div className="p-4 border-b border-slate-800">
              <Button onClick={createNewSession} className="w-full bg-purple-600 hover:bg-purple-500 gap-2">
                  <Plus className="w-4 h-4" /> New Chat
              </Button>
          </div>
          <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                  {sessions.map(sess => (
                      <div key={sess.id} className="relative group">
                          <button
                            onClick={() => setActiveSessionId(sess.id)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg text-sm flex items-center gap-2 transition-all",
                                activeSessionId === sess.id 
                                    ? "bg-slate-800 text-white border border-purple-500/30" 
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                            )}
                          >
                              <MessageSquare className="w-4 h-4 shrink-0" />
                              <span className="truncate pr-6">{sess.title}</span>
                          </button>
                          <button 
                            onClick={(e) => deleteSession(e, sess.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>
          </ScrollArea>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-950/50 backdrop-blur-sm">
           {/* Header */}
           <div className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50">
               <div className="flex items-center gap-2 text-white font-medium">
                   <Bot className="w-5 h-5 text-emerald-400" />
                   AI Tutor <span className="text-slate-500 text-xs ml-2 hidden md:inline">Powered by Gemini & Mem0</span>
               </div>
               <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
                   Menu
               </Button>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
               {messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                       <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                           <Sparkles className="w-8 h-8 text-purple-500" />
                       </div>
                       <p>Ask me anything about your studies!</p>
                       <div className="flex gap-2 text-xs">
                           <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">Physics Help</span>
                           <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">Math Solver</span>
                       </div>
                   </div>
               ) : (
                   messages.map((msg, idx) => (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}
                       >
                           <div className={cn(
                               "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                               msg.role === 'user' ? "bg-indigo-600 border-indigo-500" : "bg-emerald-600 border-emerald-500"
                           )}>
                               {msg.role === 'user' ? <User className="w-4 h-4 text-white"/> : <Bot className="w-4 h-4 text-white"/>}
                           </div>
                           
                           <div className={cn(
                               "relative max-w-[80%] space-y-2",
                               msg.role === 'user' ? "items-end flex flex-col" : "items-start"
                           )}>
                               {msg.image_url && (
                                   <img src={msg.image_url} alt="Uploaded" className="max-w-[300px] rounded-lg border border-slate-700 mb-2" />
                               )}
                                <div className={cn(
                                   "p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md whitespace-pre-wrap",
                                   msg.role === 'user' 
                                    ? "bg-indigo-600/90 text-white rounded-tr-none" 
                                    : "bg-slate-900/80 text-slate-200 border border-slate-800 rounded-tl-none"
                                )}>
                                    {msg.content}
                               </div>
                           </div>
                       </motion.div>
                   ))
               )}
               {isLoading && (
                   <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400">
                             <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                        </div>
                   </div>
               )}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-lg">
               {/* Image Preview */}
               <AnimatePresence>
                   {selectedImage && (
                       <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-2 relative inline-block"
                       >
                           <div className="relative">
                               <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-20 rounded-lg border border-slate-700" />
                               <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                               >
                                   <X className="w-3 h-3" />
                               </button>
                           </div>
                       </motion.div>
                   )}
               </AnimatePresence>

               <div className="flex gap-2 items-end">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-white"
                    onClick={() => fileInputRef.current?.click()}
                   >
                       <Paperclip className="w-5 h-5" />
                   </Button>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]) setSelectedImage(e.target.files[0])
                    }} 
                   />

                   <div className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl flex items-center px-4 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..." 
                            className="border-0 bg-transparent focus-visible:ring-0 px-0 py-3 h-auto"
                        />
                        <button 
                            onClick={startListening}
                            className={cn("p-2 transition-colors", isListening ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-white")}
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                   </div>
                   
                   <Button 
                    onClick={handleSend} 
                    disabled={isLoading || (!input.trim() && !selectedImage)}
                    className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20"
                   >
                       <Send className="w-5 h-5 ml-0.5" />
                   </Button>
               </div>
               <p className="text-xs text-center text-slate-600 mt-2">
                   Attach up to 4 images per day • Voice input supported
               </p>
           </div>
      </div>
    </div>
  )
}
