"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight, Calendar, User, Clock, ArrowLeft, X, PenTool, Loader2 } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
interface BlogPost {
  id?: string
  title: string
  items?: any
  content: string
  excerpt: string
  category: string
  date: string
  readTime: string
  author: string
  image: string
}

// Static Data (Placeholders)
const STATIC_POSTS: BlogPost[] = [
  {
    id: "static-1",
    title: "The Future of AI in Education",
    content: `Artificial Intelligence is reshaping education by providing personalized learning experiences tailored to individual student needs. 
    
    ### The Shift to Personalized Learning
    Traditional classrooms often struggle to cater to the diverse learning speeds of students. AI steps in by analyzing performance data to identify specific weaknesses and strengths.
    
    ### Immediate Feedback
    One of the biggest advantages is instant feedback. Instead of waiting for days to get quiz results, students know immediately where they went wrong and how to fix it.
    
    ### The Role of Teachers
    AI doesn't replace teachers; it empowers them. By automating administrative tasks and grading, teachers can focus more on mentorship and complex problem-solving.`,
    excerpt: "Explore how Artificial Intelligence is transforming the way students learn, providing personalized guidance and instant feedback.",
    category: "Technology",
    date: "Jan 12, 2026",
    readTime: "5 min read",
    author: "Dr. Ananya Gupta",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "static-2",
    title: "5 Tips to Ace Your Board Exams",
    content: "Board exams can be stressful, but with the right strategy, you can excel. \n\n1. **Start Early**: Don't wait for the last month. Consistency is key.\n2. **Practice Previous Papers**: Understand the pattern and time management.\n3. **Take Breaks**: The Pomodoro technique works wonders.\n4. **Healthy Diet**: Brain food matters.\n5. **Sleep**: Never compromise on 8 hours of sleep.",
    excerpt: "Proven strategies for effective revision, time management, and stress reduction during the critical exam season.",
    category: "Study Tips",
    date: "Dec 05, 2025",
    readTime: "8 min read",
    author: "Rahul Verma",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "static-3",
    title: "Understanding Student Mental Health",
    content: "Mental health is foundational to academic success. Pressure from parents and peers can lead to burnout. It is crucial to recognize signs of anxiety early and seek support.",
    excerpt: "Why well-being is just as important as grades, and how parents can support their children through academic pressure.",
    category: "Wellness",
    date: "Nov 20, 2025",
    readTime: "6 min read",
    author: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800"
  }
]

export default function BlogPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  
  const [posts, setPosts] = useState<BlogPost[]>(STATIC_POSTS)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [newTitle, setNewTitle] = useState("")
  const [newExcerpt, setNewExcerpt] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newCategory, setNewCategory] = useState("General")

  // Fetch API Blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blog-agent")
        if (res.ok) {
            const data = await res.json()
            // Map DB format to UI format
            const mappedPosts = data.map((b: any) => ({
                id: b.id,
                title: b.title,
                content: b.content,
                excerpt: b.excerpt || b.content.substring(0, 100) + "...",
                category: b.category,
                date: new Date(b.created_at).toLocaleDateString(),
                readTime: "3 min read", // Estimate
                author: b.author_name || "Community Member",
                image: b.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
            }))
            // Merge with static posts
            setPosts([...STATIC_POSTS, ...mappedPosts])
        }
      } catch (e) {
        console.error("Failed to fetch blogs", e)
      }
    }
    fetchBlogs()
  }, [])

  const handleCreateClick = () => {
      if (!isLoggedIn) {
          toast.error("Please login to write a blog post")
          router.push("/login")
          return
      }
      setIsCreateOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        // Get token from auth (context usually has it, but for simplicity we rely on cookie/localStorage if agent handles it, 
        // OR we use the user object if it has token. 
        // Looking at navbar.tsx, user object doesn't explicitly show token property in types usually.
        // But `supabase.auth.getSession()` is reliable.
        // Explicitly get session to ensure we have the latest token
        const { data: { session } } = await import("@/lib/supabase").then(m => m.supabase.auth.getSession())
        
        console.log("DEBUG: Blog Submit - Session found:", !!session)
        if (session) {
            console.log("DEBUG: Token:", session.access_token.substring(0, 10) + "...")
        }

        if (!session) {
            toast.error("Session expired")
            console.error("DEBUG: No session returned from getSession()")
            return
        }

        const res = await fetch("/api/blog-agent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                title: newTitle,
                content: newContent,
                excerpt: newExcerpt,
                category: newCategory,
                image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
                author_name: user?.name || "Guest"
            })
        })

        if (res.ok) {
            toast.success("Blog published successfully!")
            setIsCreateOpen(false)
            // Reset form
            setNewTitle("")
            setNewContent("")
            setNewExcerpt("")
            // Refresh logic could go here (re-fetch)
            window.location.reload() 
        } else {
            const err = await res.json()
            toast.error(err.detail || "Failed to publish")
        }
      } catch (e) {
          console.error(e)
          toast.error("An error occurred")
      } finally {
          setIsSubmitting(false)
      }
  }

  // PREVIEW / READ MORE SCREEN
  if (selectedPost) {
      return (
          <div className="min-h-screen bg-slate-950 text-white animate-in fade-in zoom-in-95 duration-300">
             <Navbar />
             <div className="container mx-auto px-4 py-24 max-w-4xl">
                <Button 
                    variant="ghost" 
                    className="mb-8 pl-0 hover:bg-transparent hover:text-purple-400 text-slate-400 transition-colors"
                    onClick={() => setSelectedPost(null)}
                >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back to Articles
                </Button>

                <div className="relative h-[400px] rounded-2xl overflow-hidden mb-12 shadow-2xl shadow-purple-900/20">
                    <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12">
                         <Badge className="bg-purple-600 hover:bg-purple-700 mb-4">{selectedPost.category}</Badge>
                         <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{selectedPost.title}</h1>
                         <div className="flex items-center gap-6 text-slate-300 text-sm">
                             <div className="flex items-center gap-2">
                                <span className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">{selectedPost.author[0]}</span>
                                {selectedPost.author}
                             </div>
                             <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {selectedPost.date}</span>
                             <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {selectedPost.readTime}</span>
                         </div>
                    </div>
                </div>

                <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                     {/* Simple render for markdown-like double newlines */}
                     {selectedPost.content.split('\n').map((para, idx) => (
                         <p key={idx} className="mb-4 leading-relaxed">{para}</p>
                     ))}
                </div>
             </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        
        {/* CREATE MODAL OVERLAY */}
        {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                        <h2 className="text-2xl font-bold text-white">Write a New Story</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}><X className="h-5 w-5" /></Button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Title</Label>
                            <Input 
                                placeholder="Enter an engaging title..." 
                                className="bg-slate-950 border-slate-700 text-lg font-medium text-white"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-slate-300">Category</Label>
                                <Select onValueChange={setNewCategory} defaultValue={newCategory}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Technology">Technology</SelectItem>
                                        <SelectItem value="Study Tips">Study Tips</SelectItem>
                                        <SelectItem value="Wellness">Wellness</SelectItem>
                                        <SelectItem value="Career">Career</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label className="text-slate-300">Short Excerpt</Label>
                                <Input 
                                    placeholder="Brief summary for the card view..." 
                                    className="bg-slate-950 border-slate-700 text-white"
                                    value={newExcerpt}
                                    onChange={(e) => setNewExcerpt(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Content</Label>
                            <Textarea 
                                placeholder="Share your thoughts, experiences, or advice..." 
                                className="min-h-[300px] bg-slate-950 border-slate-700 text-white font-mono text-base leading-relaxed p-4"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 min-w-[120px]">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-8">
          <Badge variant="outline" className="mb-4 text-purple-400 border-purple-500/30 px-3 py-1">Community Voices</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Margdarshak</span> Blog
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Insights, timely advice, and real stories from students and educators building the future of personalized learning.
          </p>
          
          <div className="flex justify-center gap-4">
             {/* Only basic search/filter placeholders if needed, or just the CTA */}
          </div>
        </div>

        {/* BLOG GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {posts.map((post, index) => (
            <Card key={index} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-900/10 group flex flex-col h-full">
              <div className="h-56 overflow-hidden relative cursor-pointer" onClick={() => setSelectedPost(post)}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-slate-900/80 backdrop-blur text-purple-300 border-slate-700 hover:bg-slate-900 px-3 py-1">
                        {post.category}
                    </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle 
                    className="text-xl text-white group-hover:text-purple-400 transition-colors leading-snug cursor-pointer line-clamp-2"
                    onClick={() => setSelectedPost(post)}
                >
                    {post.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 border-b border-slate-800 pb-3 w-full">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter className="pt-4 flex justify-between items-center bg-slate-950/30 mt-auto border-t border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900">
                        {post.author[0]}
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{post.author}</span>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-0 h-auto font-medium group/btn"
                    onClick={() => setSelectedPost(post)}
                >
                  Read More <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* CTA SECTION */}
        <div className="text-center relative">
             <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
             <div className="relative z-10 p-8 rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-slate-800 shadow-2xl inline-block max-w-2xl">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                    <PenTool className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Have a story to share?</h3>
                <p className="text-slate-400 mb-6">
                    Join our community of contributors. Whether you're a student with exam hacks or a teacher with pedagogical insights, your voice matters.
                </p>
                <Button 
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8 shadow-lg shadow-purple-900/20"
                    onClick={handleCreateClick}
                >
                    Write an Article
                </Button>
             </div>
        </div>
      </div>
    </div>
  )
}
