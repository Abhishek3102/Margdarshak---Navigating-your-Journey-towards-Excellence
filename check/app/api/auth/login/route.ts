import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login API route called with:", { email, password: "***" })

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Special case for test credentials in development
    if (process.env.NODE_ENV === "development" && email === "test@example.com" && password === "password123") {
      console.log("Using test credentials in development mode")
      return NextResponse.json({
        token: "mock-jwt-token-for-testing-purposes-only",
        user: {
          id: "mock-user-id",
          name: "Test User",
          email: "test@example.com",
        },
      })
    }

    // Make request to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    console.log(`Making request to backend: ${apiUrl}/api/auth/login`)

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("Backend response status:", response.status)

      if (!response.ok) {
        console.error("Login failed:", data)
        return NextResponse.json({ message: data.message || "Login failed" }, { status: response.status })
      }

      console.log("Login successful, returning token")
      return NextResponse.json(data)
    } catch (error) {
      console.error("Backend connection error:", error)

      // If backend is unavailable but using test credentials, provide mock response
      if (email === "test@example.com" && password === "password123") {
        console.log("Backend unavailable, using mock response for test credentials")
        return NextResponse.json({
          token: "mock-jwt-token-for-testing-purposes-only",
          user: {
            id: "mock-user-id",
            name: "Test User",
            email: "test@example.com",
          },
        })
      }

      throw error
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
