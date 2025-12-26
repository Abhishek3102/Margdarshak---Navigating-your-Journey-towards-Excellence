"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, BookOpen } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [name, setName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("student")
  const [grade, setGrade] = useState("Class 10")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) throw error

      if (error) throw error

      await refreshUser()
      toast({ title: "Welcome back!", description: "You have been logged in successfully." })
      
      // Artificial delay to ensure state propagates
      setTimeout(() => {
        router.push(searchParams.get("callbackUrl") || "/dashboard")
      }, 500)
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !registerEmail || !registerPassword || !confirmPassword) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" })
      return
    }
    if (registerPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
      return
    }
    if (!agreedToTerms) {
      toast({ title: "Error", description: "You must agree to the terms.", variant: "destructive" })
      return
    }

    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: name,
            role: role,
            grade: role === 'student' ? grade : undefined
          }
        }
      })

      if (error) throw error

      refreshUser()
      toast({ title: "Account Created", description: "Account created successfully! Logging you in..." })
      // Auto login or redirect to login (Supabase handles session automatically if email confirm is off)
      router.push("/dashboard")
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-black to-slate-900/20 z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>

      <div className="container relative z-10 px-4">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              AMEP <span className="text-purple-400">2026</span>
            </h1>
            <p className="text-slate-400">Your Adaptive Mastery Engine</p>
          </div>

          <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 transition-colors"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 transition-colors"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Ankush ..."
                      className="bg-slate-950/50 border-slate-700 text-white focus:border-purple-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-slate-300">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="student@example.com"
                      className="bg-slate-950/50 border-slate-700 text-white focus:border-purple-500"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-slate-300">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                              <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white">
                                <SelectValue placeholder="Select Role" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                     </div>

                     {role === "student" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-slate-300">Current Standard</Label>
                            <RadioGroup value={grade} onValueChange={setGrade} className="flex space-x-4">
                                {["Class 8", "Class 9", "Class 10"].map((cls) => (
                                    <div key={cls} className="flex items-center space-x-2">
                                        <RadioGroupItem value={cls} id={cls} className="border-slate-500 text-purple-600 focus:text-purple-600" />
                                        <Label htmlFor={cls} className={`text-sm cursor-pointer ${grade === cls ? 'text-white' : 'text-slate-400'}`}>{cls}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                     )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-pass" className="text-slate-300">Password</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      className="bg-slate-950/50 border-slate-700 text-white focus:border-purple-500"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass" className="text-slate-300">Confirm Password</Label>
                    <Input
                      id="confirm-pass"
                      type="password"
                      className="bg-slate-950/50 border-slate-700 text-white focus:border-purple-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                        id="terms" 
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        className="data-[state=checked]:bg-purple-600 border-slate-600"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-400"
                    >
                      Accept terms and conditions
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 mt-4" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

