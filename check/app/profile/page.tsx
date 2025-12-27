"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { userAPI } from "@/lib/api"

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsUpdating(true)
      await userAPI.updateProfile({ name, email })

      refreshUser()

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdating(true)
      await userAPI.changePassword({
        currentPassword,
        newPassword,
      })

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />

        <section className="pt-32 pb-16 hero-bg relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/70 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Your</span> Profile
              </h1>
              <p className="text-xl text-white/80">Manage your account settings and preferences</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src="/placeholder.svg" alt={user?.name} />
                          <AvatarFallback className="text-xl gradient-bg">
                            {user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-semibold">{user?.name}</h2>
                        <p className="text-white/60">{user?.email}</p>

                        <div className="w-full mt-6">
                          <Button
                            variant="outline"
                            className="w-full border-purple-500 text-white hover:bg-purple-500/20"
                          >
                            Change Profile Picture
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:w-2/3">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Update your profile information and password</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                          <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-slate-800/50 border-slate-700"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-800/50 border-slate-700"
                              />
                            </div>

                            <Button
                              type="submit"
                              className="gradient-bg text-white hover:opacity-90"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Profile"
                              )}
                            </Button>
                          </form>
                        </TabsContent>

                        <TabsContent value="password">
                          <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-password">Current Password</Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-slate-800/50 border-slate-700"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-slate-800/50 border-slate-700"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm New Password</Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-slate-800/50 border-slate-700"
                              />
                            </div>

                            <Button
                              type="submit"
                              className="gradient-bg text-white hover:opacity-90"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Change Password"
                              )}
                            </Button>
                          </form>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
