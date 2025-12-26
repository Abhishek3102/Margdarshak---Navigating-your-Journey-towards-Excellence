import { supabase } from "@/lib/supabase"

// For legacy/custom endpoints not covered by Supabase
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

/**
 * Course-related API calls (Supabase Wrapper)
 */
export const courseAPI = {
  getAll: async (filters?: any) => {
    // Start with base query
    let query = supabase.from('videos').select('*, chapters(*, subjects(*))')
    return query
  },

  getEnrolled: async () => {
    return { data: [] } // Placeholder for enrolled logic
  },

  getById: async (id: string) => {
    const { data } = await supabase.from('videos').select('*').eq('id', id).single()
    return data
  }
}

/**
 * Recommendation-related API calls
 */
export const recommendationAPI = {
  get: async () => {
    // Return mock recommendations for now or fetch from a 'recommendations' table if added
    return { data: [] }
  },
}

export const feedbackAPI = {
  submit: async (data: any) => { return { success: true } }
}

export const userAPI = {
  updateProfile: async (data: any) => { return { success: true } }
}

