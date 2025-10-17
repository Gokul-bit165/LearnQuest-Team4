import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, quizzesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    
    setStartingQuiz(true);
    try {
      // For now, we'll use a hardcoded quiz ID from the seeded data
      // In a real app, you'd get this from the course data or have a quiz selection
      const response = await quizzesAPI.startQuiz('68f1c5fd1ee0f1cd66f3e8b9'); // This is the quiz ID from the latest seeding
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested course could not be found.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <button
                      onClick={() => navigate('/courses')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Courses
                    </button>
                  </li>
                  <li>
                    <span className="text-gray-500">/</span>
                  </li>
                  <li>
                    <span className="text-gray-900">{course.title}</span>
                  </li>
                </ol>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Level {user?.level}</p>
                <p className="text-lg font-semibold text-blue-600">{user?.xp} XP</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{course.xp_reward}</p>
                    <p className="text-sm text-gray-500">XP Reward</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{course.modules?.length || 0}</p>
                    <p className="text-sm text-gray-500">Modules</p>
                  </div>
                </div>
              </div>

              {/* Modules */}
              {course.modules && course.modules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Modules</h3>
                  <div className="space-y-3">
                    {course.modules.map((module, index) => (
                      <div key={module.module_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {module.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {module.topics?.length || 0} topics
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">Module {module.order}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleStartQuiz}
                  disabled={startingQuiz}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startingQuiz ? 'Starting Quiz...' : 'Start Quiz'}
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
                >
                  Back to Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
