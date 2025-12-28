"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function TutorChat({ userName }: { userName: string }) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userName}! I'm your personal AI Tutor. I've analyzed your recent quiz performance and I'm ready to help. What concept are you finding difficult right now?`
    }
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll short effect
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
        const res = await axiosInstance.post("/chat/tutor", { message: userMsg })
        const aiMsg = res.data.response
        setMessages(prev => [...prev, { role: 'assistant', content: aiMsg }])
    } catch (error) {
        console.error("Chat Error", error)
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my knowledge base right now. Please try again." }])
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Card className="w-full h-[600px] flex flex-col bg-slate-900 border-purple-500/30 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500"></div>
      
      <CardHeader className="bg-slate-950/50 border-b border-slate-800 pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bot className="w-6 h-6 text-purple-400" />
            </div>
            AI Personal Tutor
        </CardTitle>
        <CardDescription>
            Powered by Mem0 • Context-Aware & Personalized for You
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
                <div key={idx} className={cn(
                    "flex w-full mb-4",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                    <div className={cn(
                        "flex gap-3 max-w-[80%]",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === 'user' ? "bg-indigo-600" : "bg-purple-600"
                        )}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white"/> : <Sparkles className="w-4 h-4 text-white"/>}
                        </div>
                        
                        <div className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md",
                            msg.role === 'user' 
                                ? "bg-indigo-600 text-white rounded-tr-none" 
                                : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                </div>
            ))}
            
            {isLoading && (
                 <div className="flex w-full justify-start mb-4">
                    <div className="flex gap-3 max-w-[80%] flex-row">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2 text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                        </div>
                    </div>
                 </div>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-4 bg-slate-950/50 border-t border-slate-800">
        <div className="flex w-full gap-2">
            <Input 
                placeholder="Ask me anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-slate-900 border-slate-700 focus-visible:ring-purple-500 text-white"
            />
            <Button onClick={handleSend} disabled={isLoading} className="bg-purple-600 hover:bg-purple-500">
                <Send className="w-4 h-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
