"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  type?: "text" | "component"
  componentName?: string
}

export function GenerativeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I am your Socratic Tutor. What concept are you exploring today?",
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate AI Latency
    setTimeout(() => {
      setIsTyping(false)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `I see you're asking about "${userMsg.content}". In the context of Class 10 Math, how would you relate this to something you already know?`,
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1500)
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border border-emerald-500/20 bg-slate-950/80 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-emerald-500/20 bg-emerald-900/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
                <h3 className="font-semibold text-white">Socratic Tutor</h3>
                <p className="text-xs text-emerald-400">Powered by Gemini 1.5</p>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "flex w-full",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="flex items-center space-x-2 text-slate-500 text-sm ml-2"
           >
             <Bot className="w-4 h-4" />
             <span>Thinking...</span>
           </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a doubt or request a quiz..."
            className="flex-1 bg-slate-950 border-slate-700 focus:border-emerald-500 text-white"
          />
          <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
