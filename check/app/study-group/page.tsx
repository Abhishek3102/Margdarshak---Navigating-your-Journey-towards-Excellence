"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Users, ArrowRight } from "lucide-react"

export default function JoinStudyGroupPage() {
    const [code, setCode] = useState("")
    const router = useRouter()

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (code.trim().length > 0) {
            router.push(`/study-group/${code.trim()}`)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="flex items-center justify-center min-h-[80vh] bg-grid-white/[0.02]">
                <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <CardTitle className="text-2xl text-white">Join Study Group</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter the code shared by your peer to join the collaborative session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div className="space-y-2">
                                <Input 
                                    placeholder="Enter Room ID (e.g., a1b2c3d4)" 
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="bg-zinc-900 border-zinc-700 text-white text-center font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium" disabled={!code.trim()}>
                                Join Session <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
