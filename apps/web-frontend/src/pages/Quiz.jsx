import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Trophy,
  Zap
} from 'lucide-react';

const Quiz = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizzesAPI.getQuizQuestions(sessionId);
        setQuizData(response.data);
        
        // Calculate time left
        const endTime = new Date(response.data.end_time);
        const now = new Date();
        const timeDiff = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(timeDiff);
      } catch (err) {
        setError('Failed to load quiz');
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer
      }));

      const response = await quizzesAPI.submitQuiz(sessionId, answersArray);
      const result = response.data;
      
      // Navigate to results page with results
      navigate('/quiz-results', { 
        state: { 
          result,
          quizTitle: 'Python Basics Quiz' // This would come from quiz data
        }
      });
    } catch (err) {
      setError('Failed to submit quiz');
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Loading quiz...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !quizData) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Error</h2>
            <p className="text-slate-400 mb-6 text-lg">{error || 'Quiz not found'}</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <Layout showSidebar={false}>
      <div className="min-h-screen flex flex-col">
        {/* Quiz Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Python Basics Quiz</h1>
                  <p className="text-slate-400">
                    Question {currentQuestionIndex + 1} of {quizData.questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                {/* Progress */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(((currentQuestionIndex + 1) / quizData.questions.length) * 100)}%
                  </div>
                  <div className="text-sm text-slate-400">Complete</div>
                </div>
                {/* Timer */}
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-red-400" />
                    <div className="text-2xl font-bold text-red-400">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">Time Left</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Quiz Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              {/* Progress Bar */}
              <div className="px-8 py-4 bg-slate-700">
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-8">
                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                    {currentQuestion.prompt}
                  </h2>
                  
                  {currentQuestion.type === 'mcq' && (
                    <div className="space-y-4">
                      {currentQuestion.choices.map((choice, index) => (
                        <label 
                          key={index} 
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            answers[currentQuestion.id] === index.toString()
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={index}
                            checked={answers[currentQuestion.id] === index.toString()}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                            answers[currentQuestion.id] === index.toString()
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-400'
                          }`}>
                            {answers[currentQuestion.id] === index.toString() && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-white text-lg">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
                    className="flex items-center px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-4">
                    {isLastQuestion ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                        className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit Quiz
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
