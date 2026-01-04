"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last Updated: January 04, 2026</p>

          <div className="prose prose-invert max-w-none text-slate-300">
            <p className="lead text-lg">
              Welcome to Margdarshak. By accessing or using our personalized learning platform, you agree to be bound by these Terms of Service.
            </p>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h3>
            <p>
              These Terms govern your access to and use of Margdarshak's services, including our AI tutoring, quizzes, and educational content. If you do not agree to these terms, simply put, do not use the Services.
            </p>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. User Accounts</h3>
            <p>
              To access certain features, you must register for an account. By creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide accurate, current, and complete account information.</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
              <li>Promptly notify us if you discover or otherwise suspect any security breaches related to the Services.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. AI Tutor & Educational Content</h3>
            <p>
              Our AI Tutor provides personalized guidance based on your interactions. While we strive for accuracy, AI responses should be used as a learning aid and not as the sole source of truth. We recommend cross-referencing critical information.
            </p>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. Privacy Policy</h3>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and share information about you.
            </p>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">5. Modifications to Services</h3>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the Services (or any part thereof) with or without notice. You agree that Margdarshak will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Services.
            </p>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">6. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at <Link href="/support" className="text-purple-400 hover:text-purple-300">support@margdarshak.com</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
