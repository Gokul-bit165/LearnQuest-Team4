import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Code, HelpCircle, BookOpen, Edit3, Star, Zap, ArrowRight, ArrowLeft, Loader2, AlertCircle, Play, Trophy } from 'lucide-react';
import { coursesAPI, lessonsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';

const LessonPage = () => {
  const { slug, moduleId, topicId } = useParams();
  const navigate = useNavigate();
  const { refreshUserProgress } = useAuth();
  
  const [topic, setTopic] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [fillAnswers, setFillAnswers] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [cardTransition, setCardTransition] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Language options with their Judge0 IDs
  const languageOptions = [
    { id: 71, name: 'Python 3', value: 'python' },
    { id: 63, name: 'JavaScript (Node.js)', value: 'javascript' },
    { id: 54, name: 'C++', value: 'cpp' },
    { id: 50, name: 'C', value: 'c' },
    { id: 62, name: 'Java', value: 'java' },
  ];

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      const response = await lessonsAPI.getTopic(topicId);
      const topicData = response.data;
      setTopic(topicData);
      
      // Initialize code answer with starter code
      const firstCodeCard = topicData.cards.find(c => c.type === 'code');
      if (firstCodeCard) {
        setCodeAnswer(firstCodeCard.starter_code || '');
      }
      
      // Initialize fill answers
      setFillAnswers(new Array(topicData.cards.filter(c => c.type === 'fill-in-blank').length).fill(''));
    } catch (err) {
      setError('Failed to load topic data');
      console.error('Error fetching topic:', err);
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
          // Do not call backend for theory; mark as correct and continue
          setCheckResult({ correct: true, explanation: 'Marked as read' });
          setShowExplanation(false);
          setIsChecking(false);
          handleContinue();
          return;
        case 'mcq':
          answer = selectedChoice; // This is already the index (0, 1, 2, etc.)
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

      const response = await lessonsAPI.checkAnswer(currentCard.card_id, answer);
      const result = response.data;
      setCheckResult(result);
      setShowExplanation(true);

      // Show XP animation if correct
      if (result.correct && result.xp_reward > 0) {
        triggerXPAnimation(result.xp_reward);
        // Refresh user progress to update XP
        await refreshUserProgress();
      }

    } catch (err) {
      console.error('Error checking answer:', err);
      setCheckResult({ correct: false, explanation: 'Error checking answer' });
    } finally {
      setIsChecking(false);
    }
  };

  const triggerXPAnimation = (xp) => {
    setXpGained(xp);
    setShowXPAnimation(true);
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowXPAnimation(false);
    }, 3000);
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    
    const currentCard = getCurrentCard();
    if (!currentCard || currentCard.type !== 'code') return;

    setIsRunning(true);
    setRunResult(null);
    
    try {
      const selectedLang = languageOptions.find(lang => lang.value === selectedLanguage);
      // Use string format for now since dict format has issues
      const response = await lessonsAPI.checkAnswer(currentCard.card_id, codeAnswer);
      
      const result = response.data;
      // For run mode, consider it successful if we got an explanation (output)
      // Also handle the case where the API returns "Invalid code format" but we have code
      const isSuccessful = (result.explanation && result.explanation.trim().length > 0) || 
                          (result.correct_answer && result.correct_answer.includes("Passed"));
      setRunResult({
        correct: isSuccessful,
        explanation: result.explanation || result.correct_answer || 'Code executed successfully'
      });
    } catch (err) {
      console.error('Error running code:', err);
      setRunResult({
        correct: false,
        explanation: 'Failed to run code. Please try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleContinue = () => {
    if (currentCardIndex < topic.cards.length - 1) {
      // Start transition animation
      setCardTransition(true);
      
      setTimeout(() => {
      setCurrentCardIndex(currentCardIndex + 1);
      setUserAnswer('');
      setSelectedChoice(null);
      setCheckResult(null);
      setRunResult(null);
      setShowExplanation(false);
      
      // Reset code answer for next code card
      const nextCard = topic.cards[currentCardIndex + 1];
      if (nextCard?.type === 'code') {
        setCodeAnswer(nextCard.starter_code || '');
      }
        
        // End transition animation
        setCardTransition(false);
      }, 300);
    } else {
      // Complete the lesson
      completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      const response = await lessonsAPI.completeTopic(topicId);
      const result = response.data;
      
      if (result.success) {
        setLessonComplete(true);
        triggerXPAnimation(result.xp_reward);
        
        // Show celebration animation
        setShowCelebration(true);
        
        // Refresh user progress data
        await refreshUserProgress();
        
        // Show streak update
        if (result.streak_count > 0) {
          setTimeout(() => {
            alert(`🔥 Streak: ${result.streak_count} days! ${result.message}`);
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleBackToModule = () => {
    navigate(`/courses/${slug}/modules/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 text-xl mb-6">{error}</p>
          <button
            onClick={() => navigate(`/courses/${slug}`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto relative">
          {/* Celebration Animation */}
          {showCelebration && (
            <div className="fixed inset-0 pointer-events-none z-50">
              <div className="absolute top-1/4 left-1/4 animate-bounce">
                <div className="text-6xl">🎉</div>
              </div>
              <div className="absolute top-1/3 right-1/4 animate-bounce delay-300">
                <div className="text-6xl">✨</div>
              </div>
              <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-700">
                <div className="text-6xl">🎊</div>
              </div>
              <div className="absolute bottom-1/4 right-1/3 animate-bounce delay-1000">
                <div className="text-6xl">🌟</div>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-8 text-center text-white shadow-2xl transform animate-pulse">
            <CheckCircle className="w-20 h-20 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold mb-4">Lesson Complete!</h1>
          <p className="text-xl mb-6">Great job completing "{topic.title}"!</p>
            <div className="bg-white/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="w-6 h-6 text-yellow-300" />
                <p className="text-2xl font-bold">You earned {topic.xp_reward} XP!</p>
              </div>
              <p className="text-lg opacity-90">Keep up the amazing work!</p>
          </div>
            <button
              onClick={handleBackToModule}
              className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Back to Module
            </button>
          </div>
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

  return (<>
    <div className="min-h-screen bg-slate-900">
      {/* XP Animation */}
      {showXPAnimation && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl animate-bounce">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6" />
              <span>+{xpGained} XP</span>
            </div>
          </div>
        </div>
      )}
      
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
          <div>
              <h1 className="text-3xl font-bold text-white mb-2">{topic.title}</h1>
              <p className="text-slate-400 text-lg">Card {currentCardIndex + 1} of {topic.cards.length}</p>
          </div>
          <button
              onClick={() => navigate(`/courses/${slug}/modules/${moduleId}`)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-all duration-200 flex items-center gap-2"
          >
              <ArrowLeft className="w-5 h-5" />
              Back to Module
          </button>
        </div>
        
        {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
          <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentCardIndex + 1) / topic.cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
        <div className={`bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-8 transition-all duration-300 ${
          cardTransition ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          {getCardIcon(currentCard.type)}
            </div>
            <div>
              <span className="text-xl font-semibold text-white">{getCardTypeLabel(currentCard.type)}</span>
              <p className="text-slate-400 text-sm">Card {currentCardIndex + 1}</p>
            </div>
        </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 leading-relaxed">{currentCard.content}</h2>
          
          {/* Theory Card */}
          {currentCard.type === 'theory' && (
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">{currentCard.explanation || 'Read and continue.'}</p>
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
                    onChange={(e) => setSelectedChoice(Number(e.target.value))}
                    className="text-blue-600"
                  />
                  <span className="text-white">{choice}</span>
                </label>
              ))}
            </div>
          )}

          {/* Code Card */}
          {currentCard.type === 'code' && (
            <div className="space-y-6">
              {/* Language Selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-300">Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-300 mb-4">Your Code Solution:</label>
                <div className="border border-slate-600 rounded-xl overflow-hidden">
                  <Editor
                    height="400px"
                    language={selectedLanguage}
                    value={codeAnswer}
                    onChange={(value) => setCodeAnswer(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 16,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      folding: true,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 0,
                      renderLineHighlight: 'line',
                      cursorStyle: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      contextmenu: true,
                      mouseWheelZoom: true,
                      smoothScrolling: true,
                      cursorBlinking: 'blink',
                      cursorSmoothCaretAnimation: true,
                    }}
                  />
                </div>
              </div>
              
              {/* Run Button for Code Challenges */}
              <div className="flex gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || !codeAnswer.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white flex items-center gap-2 font-medium"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </button>
              </div>
              
              {currentCard.test_cases && currentCard.test_cases.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-300 mb-4">Test Cases:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCard.test_cases.map((testCase, index) => (
                      <div key={index} className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                        <div className="text-sm text-slate-400 mb-2">Test Case {index + 1}</div>
                  <div className="space-y-2">
                          <div>
                            <span className="text-slate-300 font-medium">Input:</span>
                            <div className="bg-slate-800 rounded-lg p-2 mt-1 font-mono text-sm text-white">
                              {testCase.input}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-300 font-medium">Expected Output:</span>
                            <div className="bg-slate-800 rounded-lg p-2 mt-1 font-mono text-sm text-green-400">
                              {testCase.expected_output}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Run Result - Enhanced like Practice Zone */}
              {runResult && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Play className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Run Results</h3>
                  </div>

                  {/* Success/Failure Banner */}
                  <div className={`mb-4 p-4 rounded-lg border flex items-center justify-between ${
                    runResult.correct
                      ? 'bg-green-900/30 border-green-500/50'
                      : 'bg-red-900/30 border-red-500/50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {runResult.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`font-semibold ${
                        runResult.correct ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {runResult.correct ? 'Code Executed Successfully' : 'Code Execution Failed'}
                      </span>
                    </div>
                  </div>

                  {/* Output Display */}
                  {runResult.explanation && (
                    <div className="mb-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="text-slate-300 font-medium mb-2">Output:</div>
                      <div className="bg-slate-900 rounded p-3 font-mono text-sm text-white whitespace-pre-wrap">
                        {runResult.explanation}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {runResult.error && (
                    <div className="mb-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="text-slate-300 font-medium mb-2">Error:</div>
                      <div className="bg-slate-900 rounded p-3 font-mono text-sm text-red-300 whitespace-pre-wrap">
                        {runResult.error}
                      </div>
                    </div>
                  )}
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

        {/* Check Result - Enhanced like Practice Zone */}
        {checkResult && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Submission Results</h3>
            </div>

            {/* Success/Failure Banner */}
            <div className={`mb-4 p-4 rounded-lg border flex items-center justify-between ${
              checkResult.correct
                ? 'bg-green-900/30 border-green-500/50'
                : 'bg-red-900/30 border-red-500/50'
            }`}>
              <div className="flex items-center gap-2">
                {checkResult.correct ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold ${
                  checkResult.correct ? 'text-green-300' : 'text-red-300'
                }`}>
                  {checkResult.correct ? 'Accepted' : 'Wrong Answer'}
                </span>
              </div>
              <div className="text-slate-200 text-sm">
                {checkResult.xp_earned > 0 && (
                  <span className="text-yellow-400">+{checkResult.xp_earned} XP</span>
                )}
              </div>
            </div>

            {/* Explanation/Output */}
            {showExplanation && checkResult.explanation && (
              <div className="mb-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
                <div className="text-slate-300 font-medium mb-2">Result:</div>
                <div className="bg-slate-900 rounded p-3 font-mono text-sm text-white whitespace-pre-wrap">
                  {checkResult.explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
            disabled={currentCardIndex === 0}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white flex items-center gap-3 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-4">
            {/* Theory cards only show Continue button */}
            {currentCard.type === 'theory' && !checkResult && (
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white flex items-center gap-3 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Continue
              </button>
            )}

            {/* Interactive cards show Check Answer button */}
            {currentCard.type !== 'theory' && !checkResult && !runResult && (
              <button
                onClick={handleCheckAnswer}
                disabled={isChecking || (currentCard.type === 'mcq' && selectedChoice === null)}
                className={`px-8 py-3 rounded-xl text-white flex items-center gap-3 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentCard.type === 'code' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {isChecking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {currentCard.type === 'code' ? 'Submitting...' : 'Checking...'}
                  </>
                ) : (
                  <>
                    {currentCard.type === 'code' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Submit Solution
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Check Answer
                      </>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Show Continue button after checking answer or running code */}
            {(checkResult || runResult) && (
              <button
                onClick={handleContinue}
                className={`px-8 py-3 rounded-xl text-white flex items-center gap-3 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  (checkResult?.correct || runResult?.correct) 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              >
                {currentCardIndex < topic.cards.length - 1 ? (
                  <>
                    {(checkResult?.correct || runResult?.correct) ? 'Continue' : 'Continue anyway'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    {(checkResult?.correct || runResult?.correct) ? 'Complete Lesson' : 'Finish Anyway'}
                    <Star className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  </>);
};

export default LessonPage;
