import { jwtDecode } from "jwt-decode"
import { authAPI } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface DecodedToken {
  id: string
  name: string
  email: string
  role?: string
  iat: number
  exp: number
}

const isMockToken = (token: string) => {
  return token === "mock-jwt-token-for-testing-purposes-only"
}

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)

    // Also set as cookie for middleware
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`

    // Dispatch an event so other tabs can update
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("auth-change"))
  }
}

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")

    // Also remove from cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"

    // Dispatch an event so other tabs can update
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("auth-change"))
  }
}

export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false

  // Special handling for mock token
  if (isMockToken(token)) {
    return true
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp < currentTime) {
      removeToken()
      return false
    }

    return true
  } catch (error) {
    // Don't remove mock tokens on decode error
    if (!isMockToken(token)) {
      removeToken()
    }
    return false
  }
}

export const getCurrentUser = (): User | null => {
  const token = getToken()
  if (!token) return null

  // Special handling for mock token
  if (isMockToken(token)) {
    return null // Don't return fake user
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp < currentTime) {
      removeToken()
      return null
    }

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    // Don't remove mock tokens on decode error
    if (!isMockToken(token)) {
      removeToken()
    }
    return null
  }
}

export const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password)

    if (response.token) {
      setToken(response.token)
      return response
    }

    throw new Error("No token received")
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("An unknown error occurred during login")
  }
}

export const register = async (name: string, email: string, password: string, role: string = "user") => {
  try {
    const response = await authAPI.register(name, email, password, role)

    if (response.token) {
      setToken(response.token)
      return response
    }

    throw new Error("No token received")
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("An unknown error occurred during registration")
  }
}

export const logout = () => {
  removeToken()
  window.location.href = "/login"
}

export const refreshAuthState = () => {
  // Force a re-render of components that depend on auth state
  window.dispatchEvent(new Event("auth-change"))
}
