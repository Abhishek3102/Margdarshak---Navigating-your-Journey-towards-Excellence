import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Backend URL
});

// Existing functions
export const fetchRecommendations = (userId) => {
  return api.post("/api/recommendations", { userId });
};

// export const submitFeedback = (userId, feedback) => {
//   // return api.post('/feedback', { userId, feedback });
//   return api.post("/feedback/submit", { userId, feedback });
// };

// Add the missing function

export const submitFeedback = (userId, feedback) => {
  return api.post("/api/feedback", { userId, feedback });
};

export const getUserProfile = (userId) => {
  return api.get(`/api/users/${userId}`);
};
