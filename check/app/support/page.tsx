"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, MessageSquare, ExternalLink } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function SupportPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic for form submission would go here
    alert("Support request received! We'll get back to you shortly.")
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            We're Here to <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Help</span>
          </h1>
          <p className="text-xl text-slate-400">
            Encountering an issue or have some feedback? Reach out to our dedicated support team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
          {/* Contact Info Side */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
            
            <Card className="bg-slate-900 border-slate-800 shadow-lg">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-indigo-900/30 rounded-lg text-indigo-400">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-lg">Email Us</h3>
                        <p className="text-slate-400 text-sm mb-2">For general inquiries and technical support.</p>
                        <a href="mailto:support@margdarshak.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">support@margdarshak.com</a>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 shadow-lg">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400">
                        <Phone className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-lg">Call Us</h3>
                        <p className="text-slate-400 text-sm mb-2">Mon-Fri from 9am to 6pm IST.</p>
                        <a href="tel:+918001234567" className="text-purple-400 hover:text-purple-300 transition-colors">+91 800 123 4567</a>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <ul className="space-y-4">
                    <li>
                        <a href="/faq" className="flex items-center text-slate-400 hover:text-white transition-colors gap-2">
                             <ExternalLink className="h-4 w-4" /> Visit our FAQ Section
                        </a>
                    </li>
                    <li>
                        <a href="/guides" className="flex items-center text-slate-400 hover:text-white transition-colors gap-2">
                             <ExternalLink className="h-4 w-4" /> User Guides & Tutorials
                        </a>
                    </li>
                </ul>
            </div>
          </div>

          {/* Contact Form Side */}
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-300">First name</Label>
                            <Input id="firstName" placeholder="Rahul" className="bg-slate-950 border-slate-700 text-white" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-300">Last name</Label>
                            <Input id="lastName" placeholder="Kumar" className="bg-slate-950 border-slate-700 text-white" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input id="email" type="email" placeholder="rahul@example.com" className="bg-slate-950 border-slate-700 text-white" required />
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                         <Input id="subject" placeholder="How can we help?" className="bg-slate-950 border-slate-700 text-white" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-300">Message</Label>
                        <Textarea id="message" placeholder="Describe your issue in detail..." className="min-h-[150px] bg-slate-950 border-slate-700 text-white" required />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6">
                        <MessageSquare className="mr-2 h-5 w-5" /> Send Message
                    </Button>
                </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
