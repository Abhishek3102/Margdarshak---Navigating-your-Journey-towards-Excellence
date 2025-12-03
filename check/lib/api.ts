import { getToken } from "@/lib/auth"

// API base URL - make sure to set this in your environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Detect if we're in a preview environment (Vercel preview, local development without API, etc.)
const isPreviewEnvironment = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return true

  // Always use mock data in development unless API_URL is explicitly set
  if (
    process.env.NODE_ENV === "development" &&
    (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === "http://localhost:5000")
  ) {
    return true
  }

  // Check if we're in a Vercel preview deployment
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    return true
  }

  return false
}

// Use mock data in preview environments
const ALWAYS_USE_MOCK = false // Force real API usage

// If we've already had a network error, use mock data for subsequent requests
let hadNetworkError = false

interface FetchOptions extends RequestInit {
  token?: boolean
  data?: any
}

/**
 * Mock API responses for when the real API is unavailable
 */
const mockResponses = {
  // Auth endpoints
  "/api/auth/login": (data: any) => {
    // Check credentials against test user
    if (data.email === "test@example.com" && data.password === "password123") {
      return {
        token: "mock-jwt-token-for-testing-purposes-only",
        user: {
          id: "mock-user-id",
          name: "Test User",
          email: "test@example.com",
        },
      }
    }
    throw new Error("Invalid credentials")
  },

  "/api/auth/register": (data: any) => {
    return {
      token: "mock-jwt-token-for-testing-purposes-only",
      user: {
        id: "mock-user-id",
        name: data.name,
        email: data.email,
      },
    }
  },

  // Course endpoints
  "/api/courses": () => {
    return [
      {
        id: "1",
        title: "Web Development Fundamentals",
        description: "Master HTML, CSS, and JavaScript to build responsive websites from scratch.",
        image: "/placeholder.svg?height=200&width=400",
        category: "Development",
        level: "Beginner",
        duration: "8 weeks",
        students: 1245,
        rating: 4.8,
      },
      {
        id: "2",
        title: "Data Science Essentials",
        description: "Learn statistical analysis, Python, and machine learning fundamentals.",
        image: "/placeholder.svg?height=200&width=400",
        category: "Data Science",
        level: "Intermediate",
        duration: "10 weeks",
        students: 987,
        rating: 4.7,
      },
      {
        id: "3",
        title: "UX/UI Design Principles",
        description: "Create intuitive user experiences with modern design methodologies.",
        image: "/placeholder.svg?height=200&width=400",
        category: "Design",
        level: "Beginner",
        duration: "6 weeks",
        students: 756,
        rating: 4.9,
      },
    ]
  },

  // Course by ID endpoint
  "/api/courses/1": () => ({
    id: "1",
    title: "Web Development Fundamentals",
    description: "Master HTML, CSS, and JavaScript to build responsive websites from scratch.",
    image: "/placeholder.svg?height=200&width=400",
    category: "Development",
    level: "Beginner",
    duration: "8 weeks",
    students: 1245,
    rating: 4.8,
    content: {
      sections: [
        {
          title: "Getting Started with HTML",
          lessons: [
            { title: "Introduction to HTML", duration: "15 min", completed: true },
            { title: "HTML Document Structure", duration: "20 min", completed: true },
            { title: "Working with Text and Links", duration: "25 min", completed: false },
          ],
        },
        {
          title: "CSS Fundamentals",
          lessons: [
            { title: "Introduction to CSS", duration: "15 min", completed: false },
            { title: "Selectors and Properties", duration: "25 min", completed: false },
            { title: "Box Model and Layout", duration: "30 min", completed: false },
          ],
        },
      ],
    },
  }),

  "/api/courses/2": () => ({
    id: "2",
    title: "Data Science Essentials",
    description: "Learn statistical analysis, Python, and machine learning fundamentals.",
    image: "/placeholder.svg?height=200&width=400",
    category: "Data Science",
    level: "Intermediate",
    duration: "10 weeks",
    students: 987,
    rating: 4.7,
    content: {
      sections: [
        {
          title: "Python for Data Science",
          lessons: [
            { title: "Python Basics", duration: "30 min", completed: false },
            { title: "Data Structures", duration: "45 min", completed: false },
            { title: "Working with NumPy", duration: "40 min", completed: false },
          ],
        },
        {
          title: "Data Analysis",
          lessons: [
            { title: "Introduction to Pandas", duration: "35 min", completed: false },
            { title: "Data Cleaning", duration: "50 min", completed: false },
            { title: "Data Visualization", duration: "45 min", completed: false },
          ],
        },
      ],
    },
  }),

  "/api/courses/3": () => ({
    id: "3",
    title: "UX/UI Design Principles",
    description: "Create intuitive user experiences with modern design methodologies.",
    image: "/placeholder.svg?height=200&width=400",
    category: "Design",
    level: "Beginner",
    duration: "6 weeks",
    students: 756,
    rating: 4.9,
    content: {
      sections: [
        {
          title: "UX Fundamentals",
          lessons: [
            { title: "Introduction to UX", duration: "20 min", completed: false },
            { title: "User Research", duration: "35 min", completed: false },
            { title: "Personas and User Journeys", duration: "40 min", completed: false },
          ],
        },
        {
          title: "UI Design",
          lessons: [
            { title: "Design Principles", duration: "25 min", completed: false },
            { title: "Color Theory", duration: "30 min", completed: false },
            { title: "Typography", duration: "25 min", completed: false },
          ],
        },
      ],
    },
  }),

  // User endpoints
  "/api/users/profile": () => {
    return {
      id: "mock-user-id",
      name: "Test User",
      email: "test@example.com",
    }
  },

  "/api/users/courses": () => {
    return [
      {
        id: "1",
        title: "Web Development Fundamentals",
        description: "Master HTML, CSS, and JavaScript to build responsive websites from scratch.",
        image: "/placeholder.svg?height=200&width=400",
        category: "Development",
        level: "Beginner",
        duration: "8 weeks",
        students: 1245,
        rating: 4.8,
        progress: 75,
      },
    ]
  },

  "/api/recommendations": () => {
    return {
      courses: [
        {
          id: "2",
          title: "Data Science Essentials",
          description: "Learn statistical analysis, Python, and machine learning fundamentals.",
          image: "/placeholder.svg?height=200&width=400",
          category: "Data Science",
          level: "Intermediate",
          duration: "10 weeks",
          students: 987,
          rating: 4.7,
          match: 95,
        },
        {
          id: "3",
          title: "UX/UI Design Principles",
          description: "Create intuitive user experiences with modern design methodologies.",
          image: "/placeholder.svg?height=200&width=400",
          category: "Design",
          level: "Beginner",
          duration: "6 weeks",
          students: 756,
          rating: 4.9,
          match: 88,
        },
      ],
      paths: [
        {
          id: "path1",
          title: "Full-Stack Developer",
          description: "Comprehensive path to become a full-stack web developer",
          courses: 5,
          duration: "6 months",
          level: "Intermediate",
        },
        {
          id: "path2",
          title: "Data Scientist",
          description: "Master data analysis, visualization, and machine learning",
          courses: 4,
          duration: "5 months",
          level: "Advanced",
        },
      ],
    }
  },

  // Feedback endpoints
  "/api/feedback": () => {
    return { success: true, message: "Feedback submitted successfully" }
  },
}

/**
 * Get mock response for an endpoint
 */
function getMockResponse(endpoint: string, data?: any) {
  // Extract the base endpoint without query params and without ID
  const baseEndpoint = endpoint.split("?")[0]

  // Check for exact endpoint match first
  const mockFn = mockResponses[baseEndpoint as keyof typeof mockResponses]
  if (mockFn) {
    return mockFn(data)
  }

  // Handle course by ID endpoints
  if (baseEndpoint.match(/^\/api\/courses\/\d+$/)) {
    const courseId = baseEndpoint.split("/").pop()
    const specificCourseEndpoint = `/api/courses/${courseId}`

    if (mockResponses[specificCourseEndpoint as keyof typeof mockResponses]) {
      return (mockResponses[specificCourseEndpoint as keyof typeof mockResponses] as any)()
    }

    // Fallback to a generic course if specific one not found
    return {
      id: courseId,
      title: "Sample Course",
      description: "This is a sample course description.",
      image: "/placeholder.svg?height=200&width=400",
      category: "General",
      level: "Beginner",
      duration: "8 weeks",
      students: 1000,
      rating: 4.5,
    }
  }

  // Handle course enrollment
  if (baseEndpoint.match(/^\/api\/courses\/\d+\/enroll$/)) {
    return { success: true, message: "Enrolled successfully" }
  }

  // For endpoints without specific mocks, return empty data
  if (baseEndpoint.includes("/api/courses")) {
    return []
  }

  // Default fallback
  return { success: true, message: "Mock data not available for this endpoint" }
}

/**
 * Main API function that decides whether to use mock data or real API
 */
async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  // If we're in a preview environment or had a network error, use mock data
  if (ALWAYS_USE_MOCK || hadNetworkError) {
    console.log(`Using mock data for ${endpoint}`)
    return getMockResponse(endpoint, options.data)
  }

  const { token = true, data, ...customOptions } = options
  const opts: RequestInit = { ...customOptions }

  // Add authorization header if token is required and available
  if (token) {
    const authToken = getToken()
    if (authToken) {
      opts.headers = {
        ...opts.headers,
        Authorization: `Bearer ${authToken}`,
      }
    }
  }

  // Add JSON content-type header for non-GET requests with data
  if (data) {
    opts.headers = {
      ...opts.headers,
      "Content-Type": "application/json",
    }
    opts.body = JSON.stringify(data)
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`

  try {
    // Add timeout to fetch requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    opts.signal = controller.signal

    const response = await fetch(url, opts)
    clearTimeout(timeoutId)

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") === -1) {
      const text = await response.text()
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${text}`)
      }
      return text
    }

    // Parse JSON response
    const json = await response.json()

    if (!response.ok) {
      throw new Error(json.message || `API error: ${response.status}`)
    }

    return json
  } catch (error) {
    // Check if it's a network error
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("Network request failed") ||
          error.name === "AbortError"))
    ) {
      console.error("Network error, API might be unavailable:", error)
      hadNetworkError = true

      // Return mock data as fallback
      console.log(`Falling back to mock data for ${endpoint} after network error`)
      return getMockResponse(endpoint, options.data)
    }

    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Auth-related API calls
 */
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI("/api/auth/login", {
      method: "POST",
      token: false,
      data: { email, password },
    }),
  register: (name: string, email: string, password: string, role: string = "user") =>
    fetchAPI("/api/auth/register", {
      method: "POST",
      token: false,
      data: { name, email, password, role },
    }),
  getProfile: () => fetchAPI("/api/users/profile"),
  updateProfile: (data: any) => fetchAPI("/api/users/profile", { method: "PUT", data }),
  changePassword: (data: any) => fetchAPI("/api/users/password", { method: "PUT", data }),
}

/**
 * Course-related API calls
 */
export const courseAPI = {
  getAll: (filters?: any) => {
    // Convert filters object to URL parameters, handling undefined/null values
    let queryString = ""
    if (filters && Object.keys(filters).length > 0) {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value))
        }
      })
      queryString = params.toString()
      if (queryString) {
        queryString = `?${queryString}`
      }
    }
    return fetchAPI(`/api/courses${queryString}`)
  },
  getById: (id: string) => fetchAPI(`/api/courses/${id}`),
  enroll: (courseId: string) => fetchAPI(`/api/courses/${courseId}/enroll`, { method: "POST" }),
  getEnrolled: () => fetchAPI("/api/users/courses"),
  create: (data: any) => fetchAPI("/api/courses", { method: "POST", data }),
  delete: (id: string) => fetchAPI(`/api/courses/${id}`, { method: "DELETE" }),
}

/**
 * Feedback-related API calls
 */
export const feedbackAPI = {
  submit: (data: any) => fetchAPI("/api/feedback", { method: "POST", data }),
  getCourse: (courseId: string) => fetchAPI(`/api/feedback/course/${courseId}`),
  getPlatform: () => fetchAPI("/api/feedback/platform"),
}

/**
 * Recommendation-related API calls
 */
export const recommendationAPI = {
  get: () => fetchAPI("/api/recommendations"),
}

/**
 * User-related API calls
 */
export const userAPI = {
  updateProfile: (data: any) => fetchAPI("/api/users/profile", { method: "PUT", data }),
  changePassword: (data: any) => fetchAPI("/api/users/password", { method: "PUT", data }),
}

// Log whether we're using mock data
if (typeof window !== "undefined") {
  if (ALWAYS_USE_MOCK) {
    console.log("🔧 MOCK MODE: Using mock data for all API requests")
    console.log("💡 TIP: To use real API, set NEXT_PUBLIC_API_URL environment variable")
  } else {
    console.log(`🔌 API MODE: Connected to ${API_URL}`)
  }
}
