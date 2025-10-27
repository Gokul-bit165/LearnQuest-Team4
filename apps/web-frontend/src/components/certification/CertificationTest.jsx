import React, { useState, useEffect, useRef } from 'react';
import ProctoringMonitor from './ProctoringMonitor';
import api from '../../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CertificationTest = ({ attemptData, questions }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [visibilityWarning, setVisibilityWarning] = useState(false);
  
  const testContainerRef = useRef(null);
  const focusLostCountRef = useRef(0);

  useEffect(() => {
    if (attemptData?.certification?.duration_minutes) {
      setTimeRemaining(attemptData.certification.duration_minutes * 60);
    }

    // Request fullscreen
    requestFullscreen();

    // Set up visibility and focus tracking
    setupVisibilityTracking();

    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      exitFullscreen();
    };
  }, []);

  const requestFullscreen = () => {
    const element = testContainerRef.current;
    if (element) {
      element.requestFullscreen?.() ||
        element.webkitRequestFullscreen?.() ||
        element.mozRequestFullScreen?.() ||
        element.msRequestFullscreen?.();
      setFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.msExitFullscreen?.();
      setFullscreen(false);
    }
  };

  const setupVisibilityTracking = () => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setVisibilityWarning(true);
        focusLostCountRef.current += 1;
        
        // If user switches tabs multiple times, show warning
        if (focusLostCountRef.current >= 2) {
          toast.error('Multiple tab switches detected. This may affect your behavior score.');
        }
      } else {
        setVisibilityWarning(false);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.warning('You have exited fullscreen. Please return to fullscreen mode.');
        requestFullscreen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Disable context menu and text selection
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
    };
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmed = window.confirm(
      'Are you sure you want to submit the test? You cannot change your answers after submission.'
    );

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      const response = await api.post('/api/certifications/submit', {
        attempt_id: attemptData.attempt_id,
        answers: answers
      });

      toast.success('Test submitted successfully!');
      navigate(`/certifications/results/${attemptData.attempt_id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;

    toast.warning('Time is up! Submitting your test...');
    setIsSubmitting(true);

    try {
      await api.post('/api/certifications/submit', {
        attempt_id: attemptData.attempt_id,
        answers: answers
      });

      toast.success('Test submitted automatically.');
      navigate(`/certifications/results/${attemptData.attempt_id}`);
    } catch (error) {
      console.error('Error auto-submitting test:', error);
      toast.error('Failed to submit test automatically.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleViolation = (newViolations) => {
    setViolations(prev => [...prev, ...newViolations]);
    toast.warning(`Proctoring alert: ${newViolations.join(', ')}`);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div ref={testContainerRef} className="certification-test">
      {/* Proctoring Monitor */}
      <ProctoringMonitor 
        attemptId={attemptData.attempt_id} 
        onViolation={handleViolation}
      />

      {/* Test Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-40 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {attemptData?.certification?.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Time Remaining */}
              <div className="text-center">
                <div className={`text-3xl font-mono font-bold ${
                  timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Time Remaining</div>
              </div>

              {/* Progress */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {answeredCount}/{questions.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Answered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Warning */}
      {visibilityWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <span className="font-medium">
            ⚠️ You have switched tabs. Please return to the test.
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-32 pb-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                Question {currentQuestionIndex + 1} • {currentQuestion?.difficulty || 'Medium'}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestion?.title || 'Question'}
              </h2>
            </div>

            <div className="text-gray-700 mb-6 whitespace-pre-wrap">
              {currentQuestion?.problem_statement || currentQuestion?.description}
            </div>

            {/* Answers */}
            {currentQuestion?.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQuestion?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion._id] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={answers[currentQuestion._id] === option}
                      onChange={() => handleAnswerChange(currentQuestion._id, option)}
                      className="mr-3"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'coding' && (
              <textarea
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Write your code here..."
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Important: Do not close this tab or switch applications during the test.
            </div>
            <button
              onClick={exitFullscreen}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationTest;
