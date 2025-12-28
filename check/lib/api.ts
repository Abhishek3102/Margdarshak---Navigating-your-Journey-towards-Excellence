import { supabase } from "@/lib/supabase"

// For legacy/custom endpoints not covered by Supabase
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

/**
 * Auth-related API calls
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    // In a real app with Supabase Auth, you'd use supabase.auth.signInWithPassword
    // For now, mirroring the expected response structure or using a custom backend
    // adapting to what lib/auth.ts expects

    // Mock response for now if not using actual backend auth endpoint
    return { token: "mock-jwt-token-for-testing-purposes-only", user: { email, name: "User" } }
  },
  register: async (name: string, email: string, password: string, role: string) => {
    return { token: "mock-jwt-token-for-testing-purposes-only", user: { email, name, role } }
  },
  grantAccess: async (studentId: string, targetClass: string) => {
    const response = await axiosInstance.post('/auth/grant-access', { student_id: studentId, target_class: targetClass })
    return response.data
  }
}

/**
 * Course-related API calls (Supabase Wrapper)
 */
export const courseAPI = {
  getAll: async (filters?: any) => {
    // Start with base query
    let query = supabase.from('videos').select('*, chapters(*, subjects(*))')

    const { data, error } = await query
    if (error) {
      console.error("Error fetching courses:", error)
      return []
    }
    return data || []
  },

  getEnrolled: async (): Promise<any[]> => {
    // Placeholder for enrolled logic
    // In real app: return supabase.from('enrollments').select('*, course:courses(*)')
    return []
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('videos').select('*').eq('id', id).single()
    if (error) return null
    return data
  },

  create: async (courseData: any) => {
    // transform for 'videos' table if that's what we are using for courses
    const { data, error } = await supabase.from('videos').insert([courseData]).select()
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id)
    if (error) throw error
    return true
  },

  enroll: async (courseId: string) => {
    // Placeholder
    return { success: true }
  }
}

/**
 * Recommendation-related API calls
 */
export const recommendationAPI = {
  get: async () => {
    // Return mock recommendations structure expected by the page
    return {
      courses: [],
      paths: []
    }
  },
}

export const feedbackAPI = {
  submit: async (data: any) => {
    // Data format adjustment if needed
    if (data.type === 'quick' && data.feedback) {
      data.message = data.feedback;
      delete data.feedback;
    }
    const response = await axiosInstance.post('/feedback/', data)
    return response.data
  }
}

export const userAPI = {
  updateProfile: async (data: any) => { return { success: true } },
  changePassword: async (data: any) => { return { success: true } }
}

import axiosInstance from "@/lib/axios"

export const curriculumAPI = {
  getStructure: async () => {
    const response = await axiosInstance.get('/curriculum/structure')
    return response.data;
  }
}

