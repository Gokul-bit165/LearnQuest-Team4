import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const result = location.state?.result;
  const quizTitle = location.state?.quizTitle || 'Quiz';

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-4">Quiz results not available.</p>
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent work! 🎉';
    if (score >= 80) return 'Great job! 👏';
    if (score >= 70) return 'Good effort! 👍';
    if (score >= 60) return 'Not bad, keep practicing! 💪';
    return 'Keep studying and try again! 📚';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
              <p className="text-gray-600">{quizTitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Level {user?.level}</p>
                <p className="text-lg font-semibold text-blue-600">{user?.xp} XP</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Score Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-4`}>
                {result.score}%
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {getScoreMessage(result.score)}
              </h2>
              <p className="text-gray-600 mb-6">
                You answered {result.correct_answers} out of {result.total_questions} questions correctly.
              </p>
            </div>

            {/* XP and Level Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{result.xp_earned}</div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.new_total_xp}</div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Level {result.new_level}</div>
                  <div className="text-sm text-gray-600">New Level</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/courses')}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                Back to Courses
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
              >
                View Dashboard
              </button>
            </div>
          </div>

          {/* Wrong Answers Review */}
          {result.wrong_questions && result.wrong_questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Questions to Review
              </h3>
              <div className="space-y-4">
                {result.wrong_questions.map((wrong, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-red-800">
                        Question {index + 1}
                      </span>
                      <div className="text-sm text-red-600">
                        Your answer: {wrong.user_answer} | Correct: {wrong.correct_answer}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Review this topic to improve your understanding.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.correct_answers}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.total_questions - result.correct_answers}
                </div>
                <div className="text-sm text-gray-600">Incorrect Answers</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.score}%</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizResults;
