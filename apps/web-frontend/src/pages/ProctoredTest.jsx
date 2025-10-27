import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProctoredTest = () => {
  const navigate = useNavigate();
  const { topicId, difficulty } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [violations, setViolations] = useState([]);
  const [behaviorScore, setBehaviorScore] = useState(100);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Sample questions - in real implementation, these would come from API
  const questions = [
    {
      id: 1,
      question: "What is the primary purpose of React hooks?",
      options: [
        "To style components",
        "To manage state and side effects in functional components",
        "To create class components",
        "To handle routing"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "Which method is used to update state in React?",
      options: [
        "this.setState()",
        "this.updateState()",
        "useState()",
        "setState()"
      ],
      correct: 2
    },
    {
      id: 3,
      question: "What is JSX?",
      options: [
        "A JavaScript extension",
        "A syntax extension for JavaScript",
        "A new programming language",
        "A CSS framework"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "Which hook is used for side effects?",
      options: [
        "useState",
        "useEffect",
        "useContext",
        "useReducer"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "What is the virtual DOM?",
      options: [
        "A real DOM element",
        "A JavaScript representation of the DOM",
        "A CSS framework",
        "A database"
      ],
      correct: 1
    }
  ];

  const totalQuestions = questions.length;

  useEffect(() => {
    // Start timer
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start camera monitoring
    startCameraMonitoring();

    // Monitor tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation('tab_switching', 'Tab switching detected');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCameraMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }

      // Start monitoring for violations
      monitorViolations();
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error accessing camera/microphone. Please check permissions.');
      addViolation('camera_disabled', 'Camera access denied');
    }
  };

  const monitorViolations = () => {
    // Simulate violation monitoring
    const monitoringInterval = setInterval(() => {
      // Check for face presence
      if (Math.random() < 0.1) { // 10% chance of violation
        addViolation('face_absent', 'Face not detected');
      }
      
      // Check for noise
      if (Math.random() < 0.05) { // 5% chance of noise violation
        addViolation('noise_detected', 'Background noise detected');
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(monitoringInterval);
  };

  const addViolation = (type, description) => {
    const violation = {
      id: Date.now(),
      type,
      description,
      timestamp: new Date().toISOString(),
      severity: type === 'tab_switching' ? 5 : 3
    };
    
    setViolations(prev => [...prev, violation]);
    
    // Update behavior score
    const newScore = Math.max(0, behaviorScore - violation.severity);
    setBehaviorScore(newScore);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionJump = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    
    // Calculate test score
    const correctAnswers = Object.entries(answers).filter(
      ([questionId, answerIndex]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        return question && answerIndex === question.correct;
      }
    ).length;
    
    const testScore = (correctAnswers / totalQuestions) * 100;
    const finalScore = (testScore * 0.6) + (behaviorScore * 0.4);
    
    // Navigate to results
    navigate('/certification/results', {
      state: {
        testScore,
        behaviorScore,
        finalScore,
        violations,
        correctAnswers,
        totalQuestions,
        topicId,
        difficulty,
        timeSpent: 30 * 60 - timeLeft
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {topicId.toUpperCase()}
              </span>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {difficulty.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Monitored</span>
              </div>
              
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Listening</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {totalQuestions}
                </h2>
                <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-8 shadow-lg mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestionData.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      answers[currentQuestionData.id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionData.id}`}
                      value={index}
                      checked={answers[currentQuestionData.id] === index}
                      onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                      className="sr-only"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentQuestion === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestion === totalQuestions - 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentQuestion === totalQuestions - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next Question
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Proctoring Status */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Proctoring Active
              </h3>
              <div className="bg-black rounded-lg h-48 flex items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-white">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                    <p className="text-sm">Camera Disabled</p>
                  </div>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[index + 1] !== undefined
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Candidate:</span>
                  <span className="font-semibold">jhan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold">{Object.keys(answers).length}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Behavior Score:</span>
                  <span className="font-semibold text-green-600">{behaviorScore}%</span>
                </div>
                {violations.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Violations:</span>
                    <span className="font-semibold text-red-600">{violations.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctoredTest;
