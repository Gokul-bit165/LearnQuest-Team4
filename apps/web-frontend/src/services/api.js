import axios from 'axios';

// Configure base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
};

// Courses API
export const coursesAPI = {
  getCourses: () => api.get('/api/courses/'),
  getCourseBySlug: (slug) => api.get(`/api/courses/${slug}`),
};

// Quizzes API
export const quizzesAPI = {
  startQuiz: (quizId) => api.post(`/api/quizzes/${quizId}/start`),
  getQuizQuestions: (sessionId) => api.get(`/api/quizzes/${sessionId}/questions`),
  submitQuiz: (sessionId, answers) => api.post(`/api/quizzes/${sessionId}/submit`, { answers }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/api/users/me'),
  getDashboard: () => api.get('/api/users/me/dashboard'),
  getLeaderboard: (timeFilter = 'all') => api.get(`/api/users/leaderboard?time=${timeFilter}`),
};

// Lessons API
export const lessonsAPI = {
  getTopic: (topicId) => api.get(`/api/lessons/${topicId}`),
  checkAnswer: (cardId, userAnswer) => {
    const payload = typeof userAnswer === 'object' && userAnswer !== null && 'value' in userAnswer
      ? { card_id: cardId, user_answer: userAnswer, mode: userAnswer.mode }
      : { card_id: cardId, user_answer: userAnswer };
    return api.post('/api/lessons/check-answer', payload);
  },
  completeTopic: (topicId) => api.post(`/api/lessons/complete/${topicId}`),
  getUserProgress: () => api.get('/api/lessons/user-progress'),
};

// AI API
export const aiAPI = {
  explain: (question, courseId) => api.post('/api/ai/explain', { question, course_id: courseId }),
  coach: (messages) => api.post('/api/ai/coach', { messages }),
  health: () => api.get('/api/ai/health'),
};

// Problems API
export const problemsAPI = {
  getProblems: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.tag) params.append('tag', filters.tag);
    return api.get(`/api/problems?${params.toString()}`);
  },
  getProblem: (problemId) => api.get(`/api/problems/${problemId}`),
  submitSolution: (problemId, solution) => api.post(`/api/problems/submit/${problemId}`, {
    user_code: solution.code,
    language_id: solution.language_id
  }),
  runCode: (problemId, solution) => api.post(`/api/problems/run/${problemId}`, {
    user_code: solution.code,
    language_id: solution.language_id
  }),
};

export default api;
