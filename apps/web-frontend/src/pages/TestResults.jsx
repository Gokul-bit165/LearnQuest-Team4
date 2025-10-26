import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    testScore = 0,
    behaviorScore = 100,
    finalScore = 0,
    violations = [],
    correctAnswers = 0,
    totalQuestions = 5,
    topicId = 'react',
    difficulty = 'easy',
    timeSpent = 1800
  } = location.state || {};

  const topicNames = {
    'react': 'React.js',
    'nodejs': 'Node.js',
    'python': 'Python',
    'database': 'Database Design',
    'cloud': 'Cloud Computing',
    'ml': 'Machine Learning',
    'security': 'Cybersecurity',
    'uiux': 'UI/UX Design'
  };

  const topicName = topicNames[topicId] || topicId;
  const passed = finalScore >= 85;
  const certificateIssued = passed && violations.length <= 3;

  const handleRetakeTest = () => {
    navigate(`/certification/test/${topicId}/${difficulty}`);
  };

  const handleReturnHome = () => {
    navigate('/certification');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Message */}
        {!passed && (
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600">You can retake the test to improve your score</p>
          </div>
        )}

        {/* Results Cards */}
        <div className="space-y-6">
          {/* Final Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-8 shadow-lg text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Final Score</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">{finalScore.toFixed(0)}%</div>
            <div className={`inline-block px-6 py-3 rounded-lg font-semibold text-lg ${
              passed 
                ? 'bg-green-500 text-white' 
                : 'bg-orange-500 text-white'
            }`}>
              {passed ? 'PASSED' : 'NOT PASSED'}
            </div>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Score Breakdown</h3>
            <p className="text-gray-600 mb-6">How your final score was calculated</p>
            
            <div className="space-y-6">
              {/* Test Performance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Test Performance 70%</span>
                  <span className="text-sm text-gray-600">{testScore.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${testScore}%` }}
                  />
                </div>
              </div>

              {/* Behavior Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Behavior Score 30%</span>
                  <span className="text-sm text-gray-600">{behaviorScore.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${behaviorScore}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Test Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Test Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Questions</div>
                <div className="text-lg text-gray-600">{totalQuestions}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Correct</div>
                <div className="text-lg text-green-600">{correctAnswers}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Topic</div>
                <div className="text-lg text-gray-600">{topicName}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Level</div>
                <div className="text-lg text-gray-600 capitalize">{difficulty}</div>
              </div>
            </div>
          </motion.div>

          {/* Violations Summary */}
          {violations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Proctoring Violations</h3>
              <div className="space-y-3">
                {violations.map((violation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">{violation.description}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Certificate Status */}
          {certificateIssued && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate Issued!</h3>
              <p className="text-gray-600 mb-4">
                Congratulations! You have successfully earned your {topicName} certification.
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Download Certificate
              </button>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex justify-center space-x-4 mt-12"
        >
          <button
            onClick={handleReturnHome}
            className="bg-white text-blue-600 border-2 border-blue-200 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            Return to Home
          </button>
          
          <button
            onClick={handleRetakeTest}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retake Test
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TestResults;
