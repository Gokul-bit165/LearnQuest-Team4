import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ModuleHubPage from './pages/ModuleHubPage';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import Dashboard from './pages/Dashboard';
import Tutor from './pages/Tutor';
import CoachPage from './pages/CoachPage';
import EnhancedCoachPage from './pages/EnhancedCoachPage';
import Lesson from './pages/Lesson';
import PracticePage from './pages/PracticePage';
import ProblemSolverPage from './pages/ProblemSolverPage';
import Leaderboard from './pages/Leaderboard';
import CertificationsListPage from './pages/CertificationsListPage';
import CertificationPage from './pages/CertificationPage';
import CertificationTestPage from './pages/CertificationTestPage';
import CertificationLanding from './pages/CertificationLanding';
import CertificationTopics from './pages/CertificationTopics';
import CertificationDifficulty from './pages/CertificationDifficulty';
import TestEnvironmentSetup from './pages/TestEnvironmentSetup';
import PreTestRequirements from './pages/PreTestRequirements';
import ProctoredTest from './pages/ProctoredTest';
import TestResults from './pages/TestResults';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/courses" replace />} />
            <Route path="/courses" element={<Courses />} />
            
            {/* Public Course Detail */}
            <Route path="/courses/:slug" element={<CourseDetail />} />
            
            {/* Module Hub */}
            <Route 
              path="/courses/:slug/modules/:moduleId" 
              element={
                <ProtectedRoute>
                  <ModuleHubPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/quiz/:sessionId" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz-results" 
              element={
                <ProtectedRoute>
                  <QuizResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coach" 
              element={
                <ProtectedRoute>
                  <EnhancedCoachPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:slug/modules/:moduleId/topics/:topicId" 
              element={
                <ProtectedRoute>
                  <Lesson />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/:courseId" 
              element={
                <ProtectedRoute>
                  <Tutor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice" 
              element={
                <ProtectedRoute>
                  <PracticePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice/:problemId" 
              element={
                <ProtectedRoute>
                  <ProblemSolverPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            {/* Unified Certification Routes - combines course certifications with proctored tests */}
            <Route 
              path="/certifications" 
              element={
                <ProtectedRoute>
                  <CertificationsListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certifications/test/:certificationId" 
              element={
                <ProtectedRoute>
                  <CertificationTestPage />
                </ProtectedRoute>
              } 
            />
            {/* Proctored test flow routes */}
            <Route path="/certifications/proctored/topics" element={<CertificationTopics />} />
            <Route path="/certifications/proctored/difficulty/:topicId" element={<CertificationDifficulty />} />
            <Route 
              path="/certifications/proctored/setup/:topicId/:difficulty" 
              element={
                <ProtectedRoute>
                  <TestEnvironmentSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certifications/proctored/requirements/:topicId/:difficulty" 
              element={
                <ProtectedRoute>
                  <PreTestRequirements />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certifications/proctored/test/:topicId/:difficulty" 
              element={
                <ProtectedRoute>
                  <ProctoredTest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certifications/proctored/results" 
              element={
                <ProtectedRoute>
                  <TestResults />
                </ProtectedRoute>
              } 
            />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
