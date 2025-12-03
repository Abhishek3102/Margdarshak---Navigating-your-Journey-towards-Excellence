import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log("Register API route called with:", { name, email, password: "***" })

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    // Special case for development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock registration in development mode")
      return NextResponse.json({
        token: "mock-jwt-token-for-testing-purposes-only",
        user: {
          id: "mock-user-id",
          name,
          email,
        },
      })
    }

    // Make request to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    console.log(`Making request to backend: ${apiUrl}/api/auth/register`)

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      console.log("Backend response status:", response.status)

      if (!response.ok) {
        console.error("Registration failed:", data)
        return NextResponse.json({ message: data.message || "Registration failed" }, { status: response.status })
      }

      console.log("Registration successful, returning token")
      return NextResponse.json(data)
    } catch (error) {
      console.error("Backend connection error:", error)

      // If backend is unavailable, provide mock response in development
      if (process.env.NODE_ENV === "development") {
        console.log("Backend unavailable, using mock response for registration")
        return NextResponse.json({
          token: "mock-jwt-token-for-testing-purposes-only",
          user: {
            id: "mock-user-id",
            name,
            email,
          },
        })
      }

      throw error
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
