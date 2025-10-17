import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coursesAPI, quizzesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { 
  BookOpen, 
  Zap, 
  Clock, 
  ArrowLeft, 
  Play, 
  Loader2, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingQuiz, setStartingQuiz] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await coursesAPI.getCourseBySlug(slug);
        setCourse(response.data);
      } catch (err) {
        setError('Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const handleStartQuiz = async () => {
    if (!course) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if course has a quiz
    if (!course.quiz_id) {
      setError('No quiz available for this course');
      return;
    }
    
    setStartingQuiz(true);
    try {
      const response = await quizzesAPI.startQuiz(course.quiz_id);
      const { session_id } = response.data;
      navigate(`/quiz/${session_id}`);
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError('Failed to start quiz');
    } finally {
      setStartingQuiz(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
            <p className="text-slate-400 mb-6">{error || 'The requested course could not be found.'}</p>
            <Link
              to="/courses"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center mb-8" aria-label="Breadcrumb">
          <Link 
            to="/courses" 
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </nav>

        {/* Course Header */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                  <p className="text-slate-400 text-lg leading-relaxed">{course.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8 mb-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{course.xp_reward}</span>
                <span className="text-slate-400">XP Reward</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-blue-400">{course.modules?.length || 0}</span>
                <span className="text-slate-400">Modules</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleStartQuiz}
                  disabled={startingQuiz || !course.quiz_id}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                >
                  {startingQuiz ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Quiz
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Sign In to Start Quiz
                </Link>
              )}
            </div>

            {!course.quiz_id && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                <p className="text-slate-400 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  No quiz available for this course yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modules */}
        {course.modules && course.modules.length > 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Course Modules</h3>
            <div className="space-y-4">
              {course.modules.map((module, index) => (
                <div key={module.module_id} className="bg-slate-700 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">
                          {module.title}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {module.topics?.length || 0} topics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-slate-400 text-sm">Module {module.order}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CourseDetail;
