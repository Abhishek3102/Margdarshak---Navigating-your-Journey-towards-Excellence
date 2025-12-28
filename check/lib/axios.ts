
import axios, { InternalAxiosRequestConfig } from "axios"
import { supabase } from "./supabase"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
})

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
})

export default axiosInstance
