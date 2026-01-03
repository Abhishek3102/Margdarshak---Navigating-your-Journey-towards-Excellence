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
    initialMode?: 'config' | 'history' | 'result'
    isStudent?: boolean
    studentName?: string
}

interface Question {
    id: number
    question: string
    options: { A: string, B: string, C: string, D: string }
    answer: string
    hint: string
}

export function QuizGeneratorModal({ isOpen, onClose, videoUrl, videoTitle, initialMode = 'config', isStudent = false, studentName = "Student" }: QuizGeneratorModalProps) {
    const [step, setStep] = useState<'config' | 'generating' | 'review'>(initialMode === 'config' ? 'config' : 'review')
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

    // Student Interaction State
    const [studentSelections, setStudentSelections] = useState<{[key: number]: string}>({}) // qIndex -> optionKey
    const [completedQuestions, setCompletedQuestions] = useState<{[key: number]: boolean}>({}) // qIndex -> true if submitted
    const [revealedHints, setRevealedHints] = useState<{[key: number]: boolean}>({})
    const [isCreatingTask, setIsCreatingTask] = useState(false) // New State for Jira loader
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<{score: number, analysis: string, resultId?: string} | null>(null)

    useEffect(() => {
        if (isOpen && (initialMode === 'history' || initialMode === 'result')) {
            setIsLoadingHistory(true)
            axiosInstance.get(`/quiz-agent/saved?video_url=${encodeURIComponent(videoUrl)}`)
                .then(async res => {
                    if (res.data && res.data.length > 0) {
                        const history = res.data;
                        setQuizHistory(history)
                        setStep('review')
                        
                        // If Result Mode, fetch the attempt data
                        if (initialMode === 'result' && isStudent) {
                             const latestQuiz = history[0] // Assume latest
                             try {
                                 const resultRes = await axiosInstance.get(`/quiz-agent/result/${latestQuiz.id}`)
                                 if (resultRes.data.attempted) {
                                     const data = resultRes.data.data;
                                     // Hydrate State
                                     setAnalysisResult({
                                         score: data.score,
                                         analysis: data.ai_analysis,
                                         resultId: latestQuiz.id // Use existing ID for history
                                     })
                                     // Restore selections
                                     const responses = data.responses || {}
                                     const loadedSelections: any = {}
                                     const loadedCompleted: any = {}
                                     
                                     Object.keys(responses).forEach(key => {
                                         loadedSelections[key] = responses[key].selectedOption
                                         loadedCompleted[key] = true
                                     })
                                     setStudentSelections(loadedSelections)
                                     setCompletedQuestions(loadedCompleted)
                                 }
                             } catch (e) {
                                 console.error("Failed to load result details")
                             }
                        }
                    } else {
                        if (initialMode === 'history') toast.info("No saved quizzes found.")
                    }
                })
                .catch(e => toast.error("Failed to load history"))
                .finally(() => setIsLoadingHistory(false))
        }
    }, [isOpen, initialMode, videoUrl, isStudent])

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

    // Student Handlers
    const handleStudentSelect = (qIdx: number, optKey: string) => {
        if (completedQuestions[qIdx]) return // Locked after submit
        setStudentSelections(prev => ({...prev, [qIdx]: optKey}))
    }

    const handleStudentSubmit = (qIdx: number) => {
        if (!studentSelections[qIdx]) return
        setCompletedQuestions(prev => ({...prev, [qIdx]: true}))
        
        // Auto-check logic handled in render
        if (studentSelections[qIdx] === questions[qIdx].answer) {
             toast.success("Correct Answer!")
        } else {
             toast.error("Incorrect!")
        }
    }

    // Jira Integration
    const handleCreateRemedialTask = async () => {
        setIsCreatingTask(true)
        try {
            // Calculate Score
            let correctCount = 0
            questions.forEach((q, idx) => {
                if (studentSelections[idx] === q.answer) correctCount++
            })
            const score = Math.round((correctCount / questions.length) * 100)
            
            // Find weak areas (questions incorrect)
            const weakAreas = questions
                .filter((q, idx) => studentSelections[idx] !== q.answer)
                .map(q => q.question.substring(0, 50) + "...")

            await axiosInstance.post("/jira/create-remedial-task", {
                student_name: studentName,
                topic: videoTitle,
                score: score,
                weak_areas: weakAreas,
                result_id: analysisResult?.resultId
            })
            
            toast.success("Study Plan created in Jira! Check your tasks.")
            onClose()
        } catch (e: any) {
             toast.error("Failed to create task: " + (e.response?.data?.detail || e.message))
        } finally {
            setIsCreatingTask(false)
        }
    }



    // New: Final Submission Handler
    const submitQuizResult = async () => {
        setIsAnalyzing(true)
        try {
            // Prepare Data
            const currentQuiz = quizHistory[currentQuizIndex]
            if (!currentQuiz) return

            // Gather extra metrics (mocking time for now as we didn't track it per Q yet)
            const responsesPayload: any = {}
            questions.forEach((q, idx) => {
                responsesPayload[idx] = {
                    selectedOption: studentSelections[idx],
                    timeTaken: 30, // Mock: 30s per Q default
                    hintRevealed: revealedHints[idx] || false
                }
            })

            const res = await axiosInstance.post("/quiz-agent/submit-result", {
                quiz_id: currentQuiz.id,
                video_title: videoTitle,
                responses: responsesPayload,
                questions: questions
            })

            setAnalysisResult({
                score: res.data.score,
                analysis: res.data.analysis,
                resultId: res.data.result_id
            })
            toast.success("Quiz Submitted & Analyzed!")
        } catch (e: any) {
            console.error(e)
            toast.warning("Submission Issue: " + (e.response?.data?.detail || e.message))
            // If already submitted, maybe just show the previous result?
            // For now, we rely on the toast.
        } finally {
            setIsAnalyzing(false)
        }
    }
    
    // Auto-submit when all questions done (if not already submitted)
    const isQuizComplete = questions.length > 0 && Object.keys(completedQuestions).length === questions.length

    useEffect(() => {
        if (isStudent && isQuizComplete && !analysisResult && !isAnalyzing) {
             submitQuizResult()
        }
    }, [isQuizComplete, isStudent])

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
                             {!isStudent && (
                                 <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full mt-2 border-dashed border-zinc-700 text-zinc-400 hover:text-white"
                                    onClick={handleGenerateMore}
                                 >
                                    <Sparkles className="w-3 h-3 mr-2" /> Generate New
                                 </Button>
                             )}
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

                        {step === 'review' && (!isStudent || !isQuizComplete) && (
                            <div className="flex flex-col h-full gap-4 pt-2">
                                {/* Refine Bar - Teacher Only */}
                                {!isStudent && (
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
                                )}


                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="space-y-6 pb-2">
                                        {questions.map((q, idx) => {
                                            const isCompleted = completedQuestions[idx];
                                            const selected = studentSelections[idx];
                                            const isCorrect = q.answer === selected;
                                            
                                            return (
                                            <Card key={idx} className="bg-zinc-900/50 border-zinc-800">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-zinc-500 uppercase">Question {idx + 1}</Label>
                                                            {isStudent ? (
                                                                <p className="text-white text-lg font-medium py-2">{q.question}</p>
                                                            ) : (
                                                                <Textarea 
                                                                    value={q.question}
                                                                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                                                    className="bg-zinc-950 border-zinc-800 min-h-[60px] text-base"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(q.options).map(([key, val]) => {
                                                            // Logic for styling
                                                            let borderColor = 'border-zinc-800 bg-zinc-950';
                                                            let badgeColor = 'bg-zinc-800 text-zinc-400';
                                                            
                                                            if (isStudent) {
                                                                const isSelected = selected === key;
                                                                
                                                                if (isCompleted) {
                                                                    if (key === q.answer) {
                                                                         // Correct Answer always green
                                                                         borderColor = 'border-green-500/50 bg-green-900/20';
                                                                         badgeColor = 'bg-green-500 text-black';
                                                                    } else if (isSelected && key !== q.answer) {
                                                                         // Wrong Selection
                                                                         borderColor = 'border-red-500/50 bg-red-900/20';
                                                                         badgeColor = 'bg-red-500 text-black';
                                                                    } else {
                                                                         // Unselected, wrong options dim out
                                                                         borderColor = 'border-zinc-800 bg-zinc-950/50 opacity-50';
                                                                    }
                                                                } else {
                                                                    // Pre-submit selection
                                                                    if (isSelected) {
                                                                        borderColor = 'border-purple-500 bg-purple-900/20';
                                                                        badgeColor = 'bg-purple-500 text-white';
                                                                    } else {
                                                                        borderColor = 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 cursor-pointer';
                                                                    }
                                                                }
                                                            } else {
                                                                // Teacher Logic
                                                                if (q.answer === key) {
                                                                    borderColor = 'border-green-500/50 bg-green-900/10';
                                                                    badgeColor = 'bg-green-500 text-black';
                                                                }
                                                            }

                                                            return (
                                                            <div 
                                                                key={key} 
                                                                onClick={() => {
                                                                    if (isStudent && !isCompleted) handleStudentSelect(idx, key);
                                                                }}
                                                                className={`flex gap-3 items-center p-3 rounded-lg border transition-all ${borderColor}`}
                                                            >
                                                                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${badgeColor}`}>
                                                                    {key}
                                                                </div>
                                                                {isStudent ? (
                                                                    <span className="text-zinc-200">{val}</span>
                                                                ) : (
                                                                    <Input 
                                                                        value={val}
                                                                        onChange={(e) => updateOption(idx, key, e.target.value)}
                                                                        className="border-none bg-transparent h-8 p-0 focus-visible:ring-0"
                                                                    />
                                                                )}
                                                            </div>
                                                            )
                                                        })}
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2">
                                                        <div className="flex-1">
                                                            {isStudent ? (
                                                                <div>
                                                                    {!revealedHints[idx] ? (
                                                                        <Button variant="ghost" size="sm" onClick={() => setRevealedHints(prev => ({...prev, [idx]: true}))} className="text-blue-400 hover:text-blue-300 pl-0">
                                                                            <Sparkles className="w-4 h-4 mr-2" /> Show Hint
                                                                        </Button>
                                                                    ) : (
                                                                        <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded text-sm text-blue-200 animate-in fade-in">
                                                                            <span className="font-bold text-xs uppercase mr-2">Hint:</span>
                                                                            {q.hint}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <Label className="text-xs text-blue-400 uppercase">Hint (Editable)</Label>
                                                                    <Input 
                                                                        value={q.hint}
                                                                        onChange={(e) => updateQuestion(idx, 'hint', e.target.value)}
                                                                        className="bg-zinc-950 border-zinc-800 text-sm text-zinc-400 mt-1"
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {isStudent && !isCompleted && (
                                                            <Button 
                                                                onClick={() => handleStudentSubmit(idx)}
                                                                disabled={!selected}
                                                                size="sm"
                                                                className={selected ? "bg-purple-600 hover:bg-purple-500" : "bg-zinc-800 text-zinc-500"}
                                                            >
                                                                Submit Answer
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )})}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Student Quiz Result Section */}
                        {isStudent && isQuizComplete && step === 'review' && (
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom-5 custom-scrollbar w-full">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
                                    <p className="text-zinc-400">AI is analyzing your performance...</p>
                                </div>
                                
                                <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800">
                                    <CardContent className="p-6 flex flex-col items-center gap-6">
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center py-8">
                                                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                                                <p className="text-zinc-400 animate-pulse">Consulting Gemini for personalized feedback...</p>
                                            </div>
                                        ) : analysisResult ? (
                                            <>
                                                {/* Score */}
                                                <div className="flex flex-col items-center">
                                                    <div className="text-5xl font-black text-purple-400">
                                                        {analysisResult.score}%
                                                    </div>
                                                    <p className="text-sm text-zinc-500">Mastery Score</p>
                                                </div>
                                                
                                                <div className="w-full h-px bg-zinc-800" />
                                                
                                                {/* AI Feedback Text */}
                                                <div className="w-full space-y-2">
                                                    <div className="flex items-center gap-2 text-purple-300">
                                                        <Sparkles className="w-4 h-4" />
                                                        <h3 className="font-semibold">AI Performance Scribe</h3>
                                                    </div>
                                                    <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {analysisResult.analysis}
                                                    </div>
                                                </div>

                                                <div className="w-full h-px bg-zinc-800" />

                                                {/* Actions */}
                                                <div className="w-full flex gap-3">
                                                    <Button 
                                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white" 
                                                        onClick={handleCreateRemedialTask}
                                                        disabled={isCreatingTask}
                                                    >
                                                        {isCreatingTask ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                        Generate Jira Study Plan
                                                    </Button>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 text-center">
                                                    Results saved to history.
                                                </p>
                                            </>
                                        ) : (
                                            <Button onClick={submitQuizResult}>Retry Analysis</Button>
                                        )}
                                    </CardContent>
                                </Card>
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
                             {!isStudent && (
                                <>
                                    <Button variant="outline" onClick={() => { setQuizHistory([]); setStep('config'); }} className="bg-transparent border-zinc-700 text-zinc-300">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                                    </Button>
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Save
                                    </Button>
                                </>
                             )}
                             {isStudent && (
                                 <div className="flex gap-2 w-full justify-end">
                                     {!isQuizComplete && (
                                        <p className="text-xs text-zinc-500 self-center mr-auto">Answer all questions to see results.</p>
                                     )}
                                     <Button variant="outline" onClick={onClose} className="border-zinc-700">Close</Button>
                                 </div>
                             )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
