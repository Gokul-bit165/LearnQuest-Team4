import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const adminAPI = {
  // Users
  listUsers: () => api.get('/api/admin/users/'),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  createUser: (data) => api.post('/api/admin/users/', data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

  // Courses
  createCourse: (data) => api.post('/api/admin/courses', data),
  getCourse: (id) => api.get(`/api/admin/courses/${id}`),
  updateCourse: (id, data) => api.put(`/api/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/api/admin/courses/${id}`),

  // Practice Zone
  getProblems: () => api.get('/api/admin/problems/'),
  getProblem: (id) => api.get(`/api/admin/problems/${id}`),
  createProblem: (data) => api.post('/api/admin/problems/', data),
  updateProblem: (id, data) => api.put(`/api/admin/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/api/admin/problems/${id}`),
  toggleProblemStatus: (id, isActive) => api.patch(`/api/admin/problems/${id}/toggle`, { is_practice_problem: isActive }),

}

export default api


