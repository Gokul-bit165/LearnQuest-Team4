import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Code, HelpCircle, BookOpen, Edit3, Star, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { coursesAPI } from '../services/api';

const LessonPage = () => {
  const { slug, moduleId, topicId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [topic, setTopic] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [fillAnswers, setFillAnswers] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [slug, moduleId, topicId]);

  const fetchCourseData = async () => {
    try {
      const response = await coursesAPI.getCourseBySlug(slug);
      const courseData = response.data;
      setCourse(courseData);

      // Find the specific topic
      const module = courseData.modules.find(m => m.module_id === moduleId);
      if (module) {
        const topicData = module.topics.find(t => t.topic_id === topicId);
        if (topicData) {
          setTopic(topicData);
          // Initialize code answer with starter code
          const firstCodeCard = topicData.cards.find(c => c.type === 'code');
          if (firstCodeCard) {
            setCodeAnswer(firstCodeCard.starter_code || '');
          }
          // Initialize fill answers
          setFillAnswers(new Array(topicData.cards.filter(c => c.type === 'fill-in-blank').length).fill(''));
        } else {
          setError('Topic not found');
        }
      } else {
        setError('Module not found');
      }
    } catch (err) {
      setError('Failed to load course data');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCard = () => {
    return topic?.cards[currentCardIndex] || null;
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'theory': return <BookOpen className="w-6 h-6" />;
      case 'mcq': return <HelpCircle className="w-6 h-6" />;
      case 'code': return <Code className="w-6 h-6" />;
      case 'fill-in-blank': return <Edit3 className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  const getCardTypeLabel = (type) => {
    switch (type) {
      case 'theory': return 'Theory';
      case 'mcq': return 'Multiple Choice';
      case 'code': return 'Code Challenge';
      case 'fill-in-blank': return 'Fill in the Blank';
      default: return 'Theory';
    }
  };

  const handleCheckAnswer = async () => {
    if (isChecking) return;
    
    const currentCard = getCurrentCard();
    if (!currentCard) return;

    setIsChecking(true);
    setCheckResult(null);
    setShowExplanation(false);

    try {
      let answer;
      
      switch (currentCard.type) {
        case 'theory':
          answer = 'completed';
          break;
        case 'mcq':
          answer = selectedChoice;
          break;
        case 'code':
          answer = codeAnswer;
          break;
        case 'fill-in-blank':
          answer = fillAnswers;
          break;
        default:
          answer = userAnswer;
      }

      const response = await fetch('/api/lessons/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          card_id: currentCard.card_id,
          answer: answer
        })
      });

      const result = await response.json();
      setCheckResult(result);
      setShowExplanation(true);

      // Show XP animation if correct
      if (result.correct && result.xp_earned > 0) {
        showXPAnimation(result.xp_earned);
      }

    } catch (err) {
      console.error('Error checking answer:', err);
      setCheckResult({ correct: false, explanation: 'Error checking answer' });
    } finally {
      setIsChecking(false);
    }
  };

  const showXPAnimation = (xp) => {
    // Create XP animation element
    const animation = document.createElement('div');
    animation.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-xl animate-bounce';
    animation.textContent = `+${xp} XP`;
    document.body.appendChild(animation);

    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(animation);
    }, 2000);
  };

  const handleContinue = () => {
    if (currentCardIndex < topic.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setUserAnswer('');
      setSelectedChoice(null);
      setCheckResult(null);
      setShowExplanation(false);
      
      // Reset code answer for next code card
      const nextCard = topic.cards[currentCardIndex + 1];
      if (nextCard?.type === 'code') {
        setCodeAnswer(nextCard.starter_code || '');
      }
    } else {
      // Complete the lesson
      completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/complete/${topicId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setLessonComplete(true);
        showXPAnimation(result.xp_earned);
        
        // Show level up animation if applicable
        if (result.level_up) {
          setTimeout(() => {
            alert(`🎉 Level Up! You're now level ${result.new_level}!`);
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleBackToCourse = () => {
    navigate(`/courses/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading lesson...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (lessonComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-lg p-8 text-center text-white">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Lesson Complete!</h1>
          <p className="text-xl mb-6">Great job completing "{topic.title}"!</p>
          <div className="bg-white/20 rounded-lg p-4 mb-6">
            <p className="text-lg">You earned <span className="font-bold">{topic.xp_reward} XP</span> for completing this lesson!</p>
          </div>
          <button
            onClick={handleBackToCourse}
            className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const currentCard = getCurrentCard();
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">No cards found in this topic</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{topic.title}</h1>
            <p className="text-slate-400">Card {currentCardIndex + 1} of {topic.cards.length}</p>
          </div>
          <button
            onClick={() => navigate(`/courses/${slug}`)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white"
          >
            Back to Course
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / topic.cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {getCardIcon(currentCard.type)}
          <span className="text-lg font-semibold text-white">{getCardTypeLabel(currentCard.type)}</span>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">{currentCard.content}</h2>
          
          {/* Theory Card */}
          {currentCard.type === 'theory' && (
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">This is a theory card. Read the content above and click "Check" to continue.</p>
            </div>
          )}

          {/* MCQ Card */}
          {currentCard.type === 'mcq' && (
            <div className="space-y-3">
              {currentCard.choices.map((choice, index) => (
                <label key={index} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                  <input
                    type="radio"
                    name="mcq-choice"
                    value={index}
                    checked={selectedChoice === index}
                    onChange={(e) => setSelectedChoice(parseInt(e.target.value))}
                    className="text-blue-600"
                  />
                  <span className="text-white">{choice}</span>
                </label>
              ))}
            </div>
          )}

          {/* Code Card */}
          {currentCard.type === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Code:</label>
                <textarea
                  value={codeAnswer}
                  onChange={(e) => setCodeAnswer(e.target.value)}
                  className="w-full h-64 bg-slate-900 text-white font-mono text-sm rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Write your code here..."
                />
              </div>
              
              {currentCard.test_cases && currentCard.test_cases.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Test Cases:</h3>
                  <div className="space-y-2">
                    {currentCard.test_cases.map((testCase, index) => (
                      <div key={index} className="bg-slate-700 rounded-lg p-3">
                        <div className="text-sm text-slate-400">Test Case {index + 1}</div>
                        <div className="text-white">Input: {testCase.input}</div>
                        <div className="text-white">Expected: {testCase.expected_output}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fill-in-blank Card */}
          {currentCard.type === 'fill-in-blank' && (
            <div className="space-y-3">
              {currentCard.blanks.map((blank, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-white">{blank}</span>
                  <input
                    type="text"
                    value={fillAnswers[index] || ''}
                    onChange={(e) => {
                      const newAnswers = [...fillAnswers];
                      newAnswers[index] = e.target.value;
                      setFillAnswers(newAnswers);
                    }}
                    className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Your answer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check Result */}
        {checkResult && (
          <div className={`p-4 rounded-lg mb-4 ${
            checkResult.correct 
              ? 'bg-green-900/30 border border-green-500' 
              : 'bg-red-900/30 border border-red-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {checkResult.correct ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-semibold ${
                checkResult.correct ? 'text-green-400' : 'text-red-400'
              }`}>
                {checkResult.correct ? 'Correct!' : 'Incorrect'}
              </span>
              {checkResult.xp_earned > 0 && (
                <span className="text-yellow-400 font-semibold">+{checkResult.xp_earned} XP</span>
              )}
            </div>
            
            {showExplanation && checkResult.explanation && (
              <p className="text-slate-300">{checkResult.explanation}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
            disabled={currentCardIndex === 0}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            {!checkResult && (
              <button
                onClick={handleCheckAnswer}
                disabled={isChecking || (currentCard.type === 'mcq' && selectedChoice === null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white flex items-center gap-2"
              >
                {isChecking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Check
                  </>
                )}
              </button>
            )}

            {checkResult && checkResult.correct && (
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2"
              >
                {currentCardIndex < topic.cards.length - 1 ? (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Complete Lesson
                    <Star className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
