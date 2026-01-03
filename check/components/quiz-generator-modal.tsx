"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Sparkles, AlertCircle, Save, CheckCircle2, RefreshCw, Wand2 } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/lib/axios"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuizGeneratorModalProps {
    isOpen: boolean
    onClose: () => void
    videoUrl: string
    videoTitle: string
    initialMode?: 'config' | 'history'
}

interface Question {
    id: number
    question: string
    options: { A: string, B: string, C: string, D: string }
    answer: string
    hint: string
}

export function QuizGeneratorModal({ isOpen, onClose, videoUrl, videoTitle, initialMode = 'config' }: QuizGeneratorModalProps) {
    const [step, setStep] = useState<'config' | 'generating' | 'review'>(initialMode === 'history' ? 'review' : 'config')
    const [quizHistory, setQuizHistory] = useState<{ id: number, questions: Question[] }[]>([])
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    
    // Config State
    const [difficulty, setDifficulty] = useState("Medium")
    const [numQuestions, setNumQuestions] = useState("5")
    const [customInstruction, setCustomInstruction] = useState("")
    
    // Refine State
    const [refineInstruction, setRefineInstruction] = useState("")
    const [isRefining, setIsRefining] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    useEffect(() => {
        if (isOpen && initialMode === 'history') {
            setIsLoadingHistory(true)
            axiosInstance.get(`/quiz-agent/saved?video_url=${encodeURIComponent(videoUrl)}`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setQuizHistory(res.data)
                        setStep('review')
                    } else {
                        toast.info("No saved quizzes found for this video.")
                    }
                })
                .catch(e => toast.error("Failed to load history"))
                .finally(() => setIsLoadingHistory(false))
        }
    }, [isOpen, initialMode, videoUrl])

    // Current Questions (derived)
    const questions = quizHistory[currentQuizIndex]?.questions || []

    const handleGenerate = async () => {
        setStep('generating')
        try {
            // Call the Agents
            const res = await axiosInstance.post("/quiz-agent/generate", {
                video_url: videoUrl,
                difficulty,
                num_questions: parseInt(numQuestions),
                custom_instruction: customInstruction,
            })
            
            if (res.data.questions) {
                const newQuiz = {
                    id: Date.now(),
                    questions: res.data.questions
                }
                setQuizHistory(prev => [...prev, newQuiz])
                setCurrentQuizIndex(quizHistory.length) // Select the new quiz (index = current length)
                setStep('review')
                toast.success("Quiz Generated! Please review.")
            } else {
                throw new Error("No questions returned")
            }
        } catch (e: any) {
            console.error(e)
            toast.error("Generation Failed: " + (e.response?.data?.detail || e.message))
            setStep('config')
        }
    }

    const handleGenerateMore = () => {
        setStep('config')
        // We keep the history, just go back to config to generate another set.
    }

    const handleRefine = async () => {
        if (!refineInstruction.trim()) return
        setIsRefining(true)
        try {
            const res = await axiosInstance.post("/quiz-agent/refine", {
                instruction: refineInstruction,
                current_questions: questions
            })
            if (res.data.questions) {
                // Update specific quiz in history
                const updatedHistory = [...quizHistory]
                updatedHistory[currentQuizIndex] = { 
                    ...updatedHistory[currentQuizIndex], 
                    questions: res.data.questions 
                }
                setQuizHistory(updatedHistory)
                
                setRefineInstruction("")
                toast.success("Questions updated based on feedback.")
            }
        } catch (e: any) {
             toast.error("Refinement Failed")
        } finally {
            setIsRefining(false)
        }
    }

    const handleSave = async () => {
        try {
             // Save the CURRENTLY selected quiz (from history)
             await axiosInstance.post("/quiz-agent/save", {
                 video_url: videoUrl,
                 video_title: videoTitle,
                 questions: questions
             })
             toast.success("Quiz Saved to Database!")
             onClose()
        } catch (e: any) {
             console.error(e)
             toast.error("Save Failed: " + (e.response?.data?.detail || e.message))
        }
    }

    // Editable Handlers
    const updateQuestion = (index: number, field: string, value: string) => {
        const newQs = [...questions]
        // @ts-ignore
        newQs[index][field] = value
        
        const updatedHistory = [...quizHistory]
        updatedHistory[currentQuizIndex] = { 
            ...updatedHistory[currentQuizIndex], 
            questions: newQs 
        }
        setQuizHistory(updatedHistory)
    }

    const updateOption = (qIndex: number, optKey: string, value: string) => {
        const newQs = [...questions]
        // @ts-ignore
        newQs[qIndex].options[optKey] = value
        
        const updatedHistory = [...quizHistory]
        updatedHistory[currentQuizIndex] = { 
            ...updatedHistory[currentQuizIndex], 
            questions: newQs 
        }
        setQuizHistory(updatedHistory)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader className="border-b border-zinc-800 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        AI Quiz Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate assessment for: <span className="text-zinc-300 font-medium">{videoTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-1 flex gap-4">
                    {/* Left Sidebar for History (only in review mode or if history exists) */}
                    {(quizHistory.length > 0 && step === 'review') && (
                        <div className="w-48 shrink-0 border-r border-zinc-800 pr-2 flex flex-col gap-2 pt-2">
                             <Label className="text-xs text-zinc-500 uppercase px-2">Quiz Versions</Label>
                             <ScrollArea className="flex-1">
                                <div className="space-y-1">
                                     {quizHistory.map((quiz, idx) => (
                                         <Button
                                            key={quiz.id}
                                            variant="ghost"
                                            className={`w-full justify-start text-sm ${currentQuizIndex === idx ? 'bg-purple-900/20 text-purple-200' : 'text-zinc-400 hover:text-zinc-200'}`}
                                            onClick={() => setCurrentQuizIndex(idx)}
                                         >
                                            <span className="truncate">Quiz Version {idx + 1}</span>
                                            {currentQuizIndex === idx && <CheckCircle2 className="w-3 h-3 ml-auto text-purple-500" />}
                                         </Button>
                                     ))}
                                </div>
                             </ScrollArea>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 border-dashed border-zinc-700 text-zinc-400 hover:text-white"
                                onClick={handleGenerateMore}
                             >
                                <Sparkles className="w-3 h-3 mr-2" /> Generate New
                             </Button>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col overflow-hidden">
                        {step === 'config' && (
                            <div className="space-y-6 pt-4 px-2 max-w-2xl mx-auto w-full">
                                 <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg flex gap-3 text-sm text-purple-200">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        The AI (Gemini 2.5 Flash Lite) will analyze the video visual and audio content to create relevant questions. This may take 10-20 seconds.
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Difficulty</Label>
                                        <Select value={difficulty} onValueChange={setDifficulty}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Question Count</Label>
                                        <Select value={numQuestions} onValueChange={setNumQuestions}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3 Questions</SelectItem>
                                                <SelectItem value="5">5 Questions</SelectItem>
                                                <SelectItem value="10">10 Questions</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                 </div>

                                 <div className="space-y-2">
                                    <Label>Custom Instructions (Optional)</Label>
                                    <Textarea 
                                        placeholder="e.g. Focus on definitions and scientific names..." 
                                        value={customInstruction}
                                        onChange={(e) => setCustomInstruction(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                 </div>

                                 {/* Cancel Button to go back to Review if we have history */}
                                 {quizHistory.length > 0 && (
                                     <Button variant="ghost" onClick={() => setStep('review')} className="w-full text-zinc-400">
                                         Cancel (Back to Review)
                                     </Button>
                                 )}
                            </div>
                        )}

                        {step === 'generating' && (
                            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">Analyzing Video Content...</h3>
                                    <p className="text-zinc-400 text-sm">Our agents are watching, transcribing, and crafting questions.</p>
                                </div>
                            </div>
                        )}

                        {step === 'review' && (
                            <div className="flex flex-col h-full gap-4 pt-2">
                                {/* Refine Bar */}
                                <div className="flex gap-2 p-2 bg-zinc-900 rounded-lg shrink-0">
                                    <Input 
                                        className="bg-zinc-950 border-zinc-700 focus-visible:ring-purple-500"
                                        placeholder="Refine with AI: e.g. 'Make them harder', 'Fix grammar'..."
                                        value={refineInstruction}
                                        onChange={(e) => setRefineInstruction(e.target.value)}
                                    />
                                    <Button 
                                        size="icon" 
                                        className="bg-purple-600 hover:bg-purple-700"
                                        onClick={handleRefine}
                                        disabled={isRefining}
                                    >
                                        {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="space-y-6 pb-2">
                                        {questions.map((q, idx) => (
                                            <Card key={idx} className="bg-zinc-900/50 border-zinc-800">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-zinc-500 uppercase">Question {idx + 1}</Label>
                                                            <Textarea 
                                                                value={q.question}
                                                                onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                                                className="bg-zinc-950 border-zinc-800 min-h-[60px] text-base"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(q.options).map(([key, val]) => (
                                                            <div key={key} className={`flex gap-2 items-center p-2 rounded border ${q.answer === key ? 'border-green-500/50 bg-green-900/10' : 'border-zinc-800 bg-zinc-950'}`}>
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${q.answer === key ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                                    {key}
                                                                </div>
                                                                <Input 
                                                                    value={val}
                                                                    onChange={(e) => updateOption(idx, key, e.target.value)}
                                                                    className="border-none bg-transparent h-8 p-0 focus-visible:ring-0"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="pt-2">
                                                        <Label className="text-xs text-blue-400 uppercase">Hint (Editable)</Label>
                                                        <Input 
                                                            value={q.hint}
                                                            onChange={(e) => updateQuestion(idx, 'hint', e.target.value)}
                                                            className="bg-zinc-950 border-zinc-800 text-sm text-zinc-400"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t border-zinc-800">
                    {step === 'config' && (
                        <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                            <Sparkles className="w-4 h-4 mr-2" /> Generate Quiz
                        </Button>
                    )}
                    {step === 'review' && (
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                             {/* Restart/Clear All */}
                             <Button variant="outline" onClick={() => { setQuizHistory([]); setStep('config'); }} className="bg-transparent border-zinc-700 text-zinc-300">
                                <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                            </Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Save
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
