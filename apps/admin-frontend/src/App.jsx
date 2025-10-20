import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Courses from './pages/Courses'
import CreateCoursePage from './pages/CreateCoursePage'
import EditCoursePage from './pages/EditCoursePage'
import PracticeZone from './pages/PracticeZone'

function App() {
  // Capture token from URL on first load and store in localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tokenFromUrl = params.get('token')
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl)
        // Optional: trigger any auth state updates here if you have a context
        // Clean the URL (remove token)
        window.history.replaceState({}, document.title, '/')
      }
    } catch (e) {
      // no-op
    }
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/new" element={<CreateCoursePage />} />
        <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
        <Route path="/practice" element={<PracticeZone />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App


