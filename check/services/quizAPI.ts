
import { axiosInstance } from "@/lib/axios"

export const quizAPI = {
    start: async () => {
        const response = await axiosInstance.get("/quiz/start")
        return response.data
    },
    submit: async (data: { answers: Record<string, string>; time_taken: Record<string, number> }) => {
        const response = await axiosInstance.post("/quiz/submit", data)
        return response.data
    },
}
