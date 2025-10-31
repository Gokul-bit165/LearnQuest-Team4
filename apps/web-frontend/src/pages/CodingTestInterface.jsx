import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, Eye, Volume2, Play, ChevronLeft, ChevronRight, Lock, Terminal, Code2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import screenfull from 'screenfull';
import Editor from '@monaco-editor/react';
import { certificationsAPI, certTestsAPI, problemsAPI } from '../services/api';
import { toast } from 'sonner';
import WebcamProctoring from '../components/WebcamProctoring';

export const CodingTestInterface = () => {
  const { certificationId, topicId, difficulty } = useParams();
  const navigate = useNavigate();
  
  const [certification, setCertification] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState({});
  const [testResults, setTestResults] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [violations, setViolations] = useState({ tabSwitch: 0, copyPaste: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [allowedLanguages, setAllowedLanguages] = useState(['python', 'javascript', 'cpp', 'c', 'java']);
  const [proctoringViolations, setProctoringViolations] = useState([]);
  const [isInitialSetup, setIsInitialSetup] = useState(true); // Grace period for initial setup

  // Handle proctoring violations
  const handleViolation = (violations) => {
    setProctoringViolations(prev => [...violations, ...prev]);
    violations.forEach(v => {
      toast.error(v.message, { duration: 3000 });
    });
  };

  const allLanguageOptions = [
    { id: 71, name: 'Python 3', value: 'python' },
    { id: 63, name: 'JavaScript (Node.js)', value: 'javascript' },
    { id: 54, name: 'C++', value: 'cpp' },
    { id: 50, name: 'C', value: 'c' },
    { id: 62, name: 'Java', value: 'java' },
  ];
  
  // Filter languages based on admin settings
  const languageOptions = allLanguageOptions.filter(lang => 
    allowedLanguages.includes(lang.value)
  );

  useEffect(() => {
    fetchCertificationTest();
  }, [certificationId, topicId, difficulty]);

  const fetchCertificationTest = async () => {
    try {
      let certData, questionsData, attempt;
      
      // Handle proctored route: /certifications/proctored/test/:topicId/:difficulty
      if (topicId && difficulty) {
        // Start a new test attempt using the cert-tests API
        const startResponse = await certTestsAPI.startAttempt(topicId, difficulty, 'User');
        attempt = startResponse.data;
        setAttemptId(attempt.attempt_id);
        
        certData = {
          name: `${topicId} - ${difficulty}`,
          difficulty: difficulty,
          duration_minutes: attempt.duration_minutes || 60,
          restrictions: attempt.restrictions || {}
        };
        
        questionsData = attempt.questions || [];
        
        // Set allowed languages from restrictions
        if (attempt.restrictions?.allowed_languages) {
          setAllowedLanguages(attempt.restrictions.allowed_languages);
          // Set first allowed language as default if current is not allowed
          if (!attempt.restrictions.allowed_languages.includes(selectedLanguage)) {
            setSelectedLanguage(attempt.restrictions.allowed_languages[0] || 'python');
          }
        }
      } 
      // Handle new direct route: /certifications/test/:certificationId
      else if (certificationId) {
        const certResponse = await certificationsAPI.getCertification(certificationId);
        certData = certResponse.data;
        
        // Create attempt ID for proctoring (use certification ID as base)
        const timestamp = Date.now();
        const generatedAttemptId = `cert_${certificationId}_${timestamp}`;
        setAttemptId(generatedAttemptId);
        
        // Fetch problems for this certification
        const problemIds = certData.problem_ids || [];
        const problemPromises = problemIds.map(id => problemsAPI.getProblem(id));
        const problemResponses = await Promise.all(problemPromises);
        questionsData = problemResponses.map(r => r.data);
      }
      
      setCertification(certData);
      setQuestions(questionsData);
      setTimeRemaining((certData.duration_minutes || 60) * 60);
      
      // Debug: Log questions structure
      console.log('Loaded questions:', questionsData);
      if (questionsData.length > 0) {
        console.log('First question structure:', questionsData[0]);
        console.log('Test cases:', questionsData[0].public_test_cases || questionsData[0].test_cases);
      }
      
      // Initialize code for all questions
      const initialCode = {};
      questionsData.forEach((q, index) => {
        // Handle starter_code as object (with language keys) or string
        let starterCode = '';
        if (q.starter_code) {
          if (typeof q.starter_code === 'object') {
            // Get starter code for current language
            starterCode = q.starter_code[selectedLanguage] || q.starter_code['python'] || '';
          } else if (typeof q.starter_code === 'string') {
            starterCode = q.starter_code;
          }
        } else {
          starterCode = q.initial_code || '';
        }
        initialCode[index] = starterCode;
      });
      setCode(initialCode);
      
    } catch (error) {
      console.error('Error fetching certification test:', error);
      toast.error(error.response?.data?.detail || 'Failed to load certification test');
      navigate('/certification');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Grace period: allow 2 seconds for webcam to start before enforcing fullscreen
    const setupTimer = setTimeout(() => {
      setIsInitialSetup(false);
      console.log('✅ Initial setup complete - fullscreen enforcement active');
    }, 2000);

    // Request fullscreen after webcam has time to start (800ms)
    const fullscreenTimer = setTimeout(() => {
      console.log('🔒 Requesting fullscreen...');
      if (screenfull.isEnabled && !screenfull.isFullscreen) {
        screenfull.request().catch(err => {
          console.error('Failed to enter fullscreen:', err);
          toast.warning('Please enable fullscreen mode for this test');
        });
      }
    }, 800);

    // Continuous fullscreen monitor - checks every 500ms and forces fullscreen
    const fullscreenMonitor = setInterval(() => {
      if (!isInitialSetup && screenfull.isEnabled && !screenfull.isFullscreen) {
        console.log('⚠️ Fullscreen lost! Forcing re-entry...');
        screenfull.request().catch(err => console.error('Monitor: Failed to enter fullscreen:', err));
      }
    }, 500);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const newCount = prev.tabSwitch + 1;
          const totalViolations = newCount + prev.copyPaste;
          
          if (totalViolations >= 3) {
            toast.error('❌ DISQUALIFIED: 3+ violations detected! Test will be auto-submitted.', {
              duration: 5000,
              style: { background: '#dc2626', color: 'white', fontSize: '16px', fontWeight: 'bold' }
            });
            setTimeout(() => handleSubmitTest(), 3000);
          } else {
            toast.warning(`⚠️ VIOLATION ${totalViolations}/3: Tab switching detected! Returning to fullscreen...`, {
              duration: 4000,
              style: { background: '#ea580c', color: 'white', fontSize: '14px', fontWeight: 'bold' }
            });
          }
          
          return { ...prev, tabSwitch: newCount };
        });
      } else {
        // When user returns to tab, force fullscreen immediately
        if (screenfull.isEnabled && !screenfull.isFullscreen && !isInitialSetup) {
          setTimeout(() => {
            screenfull.request().catch(err => console.error('Failed to re-enter fullscreen:', err));
          }, 200);
        }
      }
    };
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Test in progress! Are you sure you want to leave?';
      return e.returnValue;
    };
    
    const preventNavigation = (e) => {
      // Prevent back button
      if (e.key === 'Backspace' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      const restrictions = certification?.restrictions || {};
      
      // CRITICAL: Block Escape key with highest priority
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        toast.error('🚫 Escape is disabled! You must remain in fullscreen.', {
          duration: 2000,
          style: { background: '#dc2626', color: 'white', fontSize: '16px', fontWeight: 'bold' }
        });
        
        // Immediately force fullscreen back
        if (screenfull.isEnabled && !screenfull.isFullscreen) {
          screenfull.request();
        }
        
        // Record as violation attempt
        setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
        return false;
      }
      
      // Block F11 to prevent manual fullscreen toggle
      if (e.key === 'F11' || e.keyCode === 122) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        toast.error('🚫 F11 is disabled during test!', {
          duration: 2000,
          style: { background: '#dc2626', color: 'white', fontSize: '14px' }
        });
        
        // Force fullscreen if needed
        if (screenfull.isEnabled && !screenfull.isFullscreen) {
          screenfull.request();
        }
        return false;
      }
      
      // Block tab switching with keyboard
      if ((e.ctrlKey || e.altKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        toast.error('⚠️ Tab switching is not allowed!');
        setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
        return;
      }
      
      // Block copy/paste
      if (restrictions.copy_paste === false && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'c' || e.key === 'v' || e.key === 'x') {
          e.preventDefault();
          setViolations(prev => {
            const newCount = prev.copyPaste + 1;
            const totalViolations = prev.tabSwitch + newCount;
            
            if (totalViolations >= 3) {
              toast.error('❌ DISQUALIFIED: 3+ violations detected! Test will be auto-submitted.', {
                duration: 5000,
                style: { background: '#dc2626', color: 'white' }
              });
              setTimeout(() => handleSubmitTest(), 3000);
            } else {
              toast.warning(`⚠️ WARNING ${totalViolations}/3: Copy/Paste detected!`, {
                duration: 4000,
                style: { background: '#ea580c', color: 'white' }
              });
            }
            
            return { ...prev, copyPaste: newCount };
          });
        }
      }
      
      // Block F12 developer tools
      if (e.key === 'F12') {
        e.preventDefault();
        toast.error('Developer tools are disabled during test');
      }
    };
    
    // Handle fullscreen exit attempts
    const handleFullscreenChange = () => {
      // Skip enforcement during initial setup (webcam starting)
      if (isInitialSetup) {
        console.log('⏳ Initial setup - skipping fullscreen enforcement');
        return;
      }

      if (screenfull.isEnabled && !screenfull.isFullscreen) {
        toast.error('⚠️ You must remain in fullscreen! Returning...', {
          duration: 3000,
          style: { background: '#dc2626', color: 'white', fontSize: '14px', fontWeight: 'bold' }
        });
        
        // Record violation
        setViolations(prev => {
          const newCount = prev.tabSwitch + 1;
          return { ...prev, tabSwitch: newCount };
        });
        
        // Force back to fullscreen immediately
        setTimeout(() => {
          if (screenfull.isEnabled && !screenfull.isFullscreen) {
            screenfull.request().catch(err => console.error('Failed to re-enter fullscreen:', err));
          }
        }, 300);
      }
    };

    // Additional keydown handler specifically for Escape (capture phase)
    const handleEscapeCapture = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleContextMenu = (e) => {
      if (certification?.restrictions?.right_click === false) {
        e.preventDefault();
        toast.error('Right-click is disabled');
      }
    };

    // Add Escape blocker in capture phase (highest priority)
    document.addEventListener('keydown', handleEscapeCapture, true);
    document.addEventListener('keyup', handleEscapeCapture, true);
    window.addEventListener('keydown', handleEscapeCapture, true);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', preventNavigation);
    
    // Listen for fullscreen changes
    if (screenfull.isEnabled) {
      screenfull.on('change', handleFullscreenChange);
    }
    
    // Prevent browser back button
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      toast.warning('Navigation blocked during test!');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(setupTimer);
      clearTimeout(fullscreenTimer);
      clearInterval(fullscreenMonitor);
      
      // Remove escape capture listeners
      document.removeEventListener('keydown', handleEscapeCapture, true);
      document.removeEventListener('keyup', handleEscapeCapture, true);
      window.removeEventListener('keydown', handleEscapeCapture, true);
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', preventNavigation);
      window.removeEventListener('popstate', handlePopState);
      
      if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
        if (screenfull.isFullscreen) screenfull.exit();
      }
    };
  }, [certification]);

  useEffect(() => {
    if (timeRemaining === null || isLoading) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.info('⏰ Time is up! Auto-submitting test...', {
            duration: 3000,
            style: { background: '#0891b2', color: 'white', fontSize: '14px', fontWeight: 'bold' }
          });
          setTimeout(() => {
            handleSubmitTest();
          }, 1000);
          return 0;
        }
        
        // Warning at 5 minutes remaining
        if (prev === 300) {
          toast.warning('⚠️ Only 5 minutes remaining!', {
            duration: 5000,
            style: { background: '#ea580c', color: 'white', fontSize: '14px' }
          });
        }
        
        // Warning at 1 minute remaining
        if (prev === 60) {
          toast.error('⚠️ Only 1 minute remaining!', {
            duration: 5000,
            style: { background: '#dc2626', color: 'white', fontSize: '14px', fontWeight: 'bold' }
          });
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, timeRemaining]);

  const handleCodeChange = (value) => {
    setCode(prev => ({ ...prev, [currentQuestion]: value || '' }));
  };

  const handleRunCode = async () => {
    if (!code[currentQuestion]?.trim()) {
      toast.error('Please write some code first');
      return;
    }
    
    setIsRunning(true);
    
    try {
      const selectedLang = languageOptions.find(lang => lang.value === selectedLanguage);
      const currentQ = questions[currentQuestion];
      
      // Use public test cases for run
      let testCases = currentQ.public_test_cases || currentQ.test_cases || [];
      
      // Filter only non-hidden test cases if is_hidden property exists
      if (!testCases.filter) {
        testCases = Array.isArray(testCases) ? testCases : [];
      }
      testCases = testCases.filter(tc => !tc.is_hidden);
      
      // If no test cases, show error
      if (!testCases || testCases.length === 0) {
        toast.error('No test cases available');
        setIsRunning(false);
        return;
      }
      
      console.log('Running with test cases:', testCases);
      
      // Use cert tests API for certification tests
      const response = await certTestsAPI.runCode({
        language_id: selectedLang.id,
        source_code: code[currentQuestion],
        test_cases: testCases
      });
      
      const result = response.data;
      
      // Store results for display in Run Results section
      setTestResults(prev => ({ ...prev, [currentQuestion]: result }));
      
      if (result.overall_passed) {
        toast.success('All test cases passed!');
      } else {
        toast.error('Some test cases failed');
      }
    } catch (error) {
      console.error('Error running code:', error);
      toast.error(error.response?.data?.detail || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitProblem = async () => {
    if (!code[currentQuestion]?.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }
    
    setIsRunning(true);
    setConsoleOutput('Submitting solution...\n\n');
    setShowConsole(true);
    
    try {
      const selectedLang = languageOptions.find(lang => lang.value === selectedLanguage);
      const currentQ = questions[currentQuestion];
      
      // Get all test cases (public + hidden) for submission
      let allTestCases = currentQ.test_cases || [];
      
      // If test_cases doesn't exist, try combining public and hidden
      if (allTestCases.length === 0) {
        allTestCases = [
          ...(currentQ.public_test_cases || []),
          ...(currentQ.hidden_test_cases || [])
        ];
      }
      
      // If still no test cases, show error
      if (!allTestCases || allTestCases.length === 0) {
        setConsoleOutput('Error: No test cases available for this problem.\nPlease contact the administrator.');
        toast.error('No test cases available');
        setIsRunning(false);
        return;
      }
      
      console.log('Submitting with test cases:', allTestCases);
      
      // Use cert tests API for certification tests
      const response = await certTestsAPI.runCode({
        language_id: selectedLang.id,
        source_code: code[currentQuestion],
        test_cases: allTestCases
      });
      
      const result = response.data;
      const passedCount = result.results.filter(r => r.passed).length;
      const totalTests = result.results.length;
      
      let output = `${'='.repeat(50)}\n\n`;
      output += `Submission Result: ${passedCount}/${totalTests} test cases passed\n\n`;
      
      result.results.forEach((r, idx) => {
        const label = r.is_hidden ? 'Hidden' : 'Open';
        output += `${label} Test Case ${r.test_case_number}: ${r.passed ? '✓ PASSED' : '✗ FAILED'}\n`;
        if (!r.passed && r.error) {
          output += `  Error: ${r.error}\n`;
        }
      });
      
      output += `\n${'='.repeat(50)}\n\n`;
      output += result.overall_passed 
        ? '✓ All test cases passed! Solution accepted.' 
        : '✗ Some test cases failed. Review your code and try again.';
      
      setConsoleOutput(output);
      setTestResults(prev => ({ ...prev, [currentQuestion]: result }));
      
      if (result.overall_passed) {
        toast.success(`Problem ${currentQuestion + 1} submitted successfully!`);
      } else {
        toast.error('Some test cases failed');
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setConsoleOutput('Error: Failed to submit solution\n' + (error.response?.data?.detail || error.message));
      toast.error('Failed to submit solution');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    if (!confirm('Are you sure you want to submit the entire test? This action cannot be undone.')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For cert tests with attemptId, use finish endpoint
      if (attemptId) {
        await certTestsAPI.finishAttempt(attemptId);
        if (screenfull.isEnabled && screenfull.isFullscreen) screenfull.exit();
        toast.success('Test submitted successfully!');
        navigate('/certification');
      } else {
        // Fallback for old certification system
        const submissions = [];
        for (let i = 0; i < questions.length; i++) {
          if (code[i] && code[i].trim()) {
            const selectedLang = languageOptions.find(lang => lang.value === selectedLanguage);
            const problemId = questions[i].id || questions[i]._id || questions[i].problem_id;
            const response = await problemsAPI.submitSolution(problemId, {
              code: code[i],
              language_id: selectedLang.id
            });
            submissions.push(response.data);
          }
        }
        
        await certificationsAPI.submitCertificationAttempt(certificationId, {
          answers: submissions,
          violations: violations,
          time_taken: (certification.duration_minutes * 60) - timeRemaining
        });
        
        if (screenfull.isEnabled && screenfull.isFullscreen) screenfull.exit();
        toast.success('Test submitted successfully!');
        navigate(`/certifications/${certificationId}/result`);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const result = testResults[index];
    const hasCode = code[index] && code[index] !== questions[index]?.starter_code;
    if (!hasCode) return 'unattempted';
    if (!result) return 'attempted';
    if (result.overall_passed) return 'passed';
    return 'failed';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-xl">Loading test...</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-xl">No questions available</div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentCode = code[currentQuestion] || currentQ.starter_code || '';
  const currentResults = testResults[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top Bar */}
      <div className="border-b border-slate-700 bg-slate-800/90 backdrop-blur-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Code2 className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-lg">{certification?.title || 'Coding Test'}</span>
            <Badge variant="outline" className="border-blue-500 text-blue-400">Proctored</Badge>
            {languageOptions.length === 1 && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-900/20">
                🔒 {languageOptions[0].name} Only
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {certification?.proctoring_enabled && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-green-400" />
                  <span className="text-green-300">Monitored</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="h-4 w-4 text-green-400" />
                  <span className="text-green-300">Listening</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="font-mono font-bold text-blue-300">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="px-6 py-3 border-t border-purple-700/20 flex items-center gap-3">
          <span className="text-sm text-gray-400">Problems:</span>
          <div className="flex gap-2">
            {questions.map((q, index) => {
              const status = getQuestionStatus(index);
              const isCurrent = index === currentQuestion;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-700 text-white border border-blue-600'
                      : status === 'passed'
                      ? 'bg-green-700/30 text-green-400 border border-green-600'
                      : status === 'failed'
                      ? 'bg-red-800/30 text-red-400 border border-red-600'
                      : status === 'attempted'
                      ? 'bg-blue-800/20 text-blue-400 border border-blue-600/50'
                      : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:border-purple-600'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-slate-700 flex flex-col bg-slate-900/50 overflow-hidden">
          {/* No tabs - continuous scroll */}

          {/* Content - Single scroll area */}
          <div className="flex-1 overflow-auto p-6 space-y-8">
            {/* Problem Description Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Problem Description</h2>
              <h3 className="text-lg font-semibold text-slate-200 mb-3">{currentQ.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={
                  currentQ.difficulty === 'Easy' 
                    ? 'bg-green-700/40 text-green-300 border border-green-600' 
                    : currentQ.difficulty === 'Medium'
                    ? 'bg-yellow-700/40 text-yellow-300 border border-yellow-600'
                    : 'bg-red-700/40 text-red-300 border border-red-600'
                }>
                  {currentQ.difficulty}
                </Badge>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                {currentQ.prompt || currentQ.content}
              </p>

              {currentQ.tags && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-400">Tags:</span>
                  {(Array.isArray(currentQ.tags) ? currentQ.tags : [currentQ.tags]).map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Test Cases Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Test Cases</h2>
              {currentQ.public_test_cases && currentQ.public_test_cases.length > 0 ? (
                <div className="space-y-3">
                  {currentQ.public_test_cases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-slate-800 border-slate-700"
                    >
                      <div className="mb-3">
                        <span className="text-sm font-semibold text-white">
                          Test Case {idx + 1}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-semibold text-blue-400 min-w-[80px]">Input:</span>
                          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">{tc.input || '(empty)'}</pre>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-semibold text-green-400 min-w-[80px]">Expected:</span>
                          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">{tc.expected_output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No test cases available
                </div>
              )}

              <div className="mt-4 p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-1">Hidden Test Cases</h4>
                    <p className="text-sm text-slate-300">
                      Additional hidden test cases will be used during final evaluation to assess edge cases, 
                      performance, and correctness. Make sure your solution handles all possible scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Results Section */}
            {currentResults && currentResults.results && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Run Results</h2>
                
                {/* Overall Result */}
                <div className={`p-4 rounded-lg border mb-4 ${
                  currentResults.overall_passed 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    {currentResults.overall_passed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${currentResults.overall_passed ? 'text-green-300' : 'text-red-300'}`}>
                        {currentResults.overall_passed ? 'Accepted' : 'Wrong Answer'}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {currentResults.results.filter(r => r.passed).length} / {currentResults.results.length} test cases passed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Test Results */}
                <div className="space-y-3">
                  {currentResults.results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        result.passed
                          ? 'bg-green-900/20 border-green-700/50'
                          : 'bg-red-900/20 border-red-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${result.passed ? 'text-green-300' : 'text-red-300'}`}>
                          Test {idx + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                        {result.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-slate-400 min-w-[80px]">Expected:</span>
                          <pre className="text-slate-300 font-mono whitespace-pre-wrap">{result.expected_output}</pre>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={`font-semibold min-w-[80px] ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            Got:
                          </span>
                          <pre className={`font-mono whitespace-pre-wrap ${result.passed ? 'text-green-300' : 'text-red-300'}`}>
                            {result.output || '(empty)'}
                          </pre>
                        </div>
                        {result.error && (
                          <div className="mt-2 p-2 bg-red-900/30 border border-red-700/50 rounded">
                            <span className="font-semibold text-red-400">Error:</span>
                            <pre className="font-mono text-red-300 mt-1 whitespace-pre-wrap">{result.error}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Fixed Proctoring Overlay - Bottom Right */}
        {attemptId && !isLoading && (
          <WebcamProctoring 
            attemptId={attemptId}
            onViolation={handleViolation}
          />
        )}

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-slate-900">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center gap-3">
              <Code2 className="h-4 w-4 text-slate-400" />
              <select 
                className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded text-sm hover:border-blue-500 transition-colors focus:outline-none focus:border-blue-500"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={languageOptions.length === 1}
              >
                {languageOptions.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.name}</option>
                ))}
              </select>
              {languageOptions.length === 1 && (
                <span className="text-xs text-yellow-400 font-semibold">🔒 Language Locked</span>
              )}
              {languageOptions.length === 0 && (
                <span className="text-xs text-red-400">⚠️ No languages allowed</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || !code[currentQuestion]?.trim()}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button
                onClick={handleSubmitProblem}
                disabled={isRunning || !code[currentQuestion]?.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 h-full">
            <Editor
              height="100%"
              defaultLanguage={selectedLanguage}
              language={selectedLanguage}
              theme="vs-dark"
              value={currentCode}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-700 bg-slate-800/90 px-6 py-3 flex items-center justify-between relative z-[60]">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg border border-slate-600 flex items-center gap-2 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        
        <div className="flex items-center gap-6">
          <div className="text-sm text-slate-300">
            Problem {currentQuestion + 1} of {questions.length}
          </div>
          
          {/* Finish Test Button (only on last question) */}
          {currentQuestion === questions.length - 1 && (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-bold text-base shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              {isSubmitting ? 'Submitting...' : 'FINISH TEST'}
            </button>
          )}
        </div>

        <button
          onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          disabled={currentQuestion === questions.length - 1}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg border border-blue-600 flex items-center gap-2 transition-all"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>



      {/* Violations */}
      {(violations.tabSwitch > 0 || violations.copyPaste > 0) && (
        <div className="fixed bottom-6 left-6 z-50">
          <Card className="border-2 border-red-600/70 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur shadow-xl">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-300">Violations Detected</span>
              </div>
              {violations.tabSwitch > 0 && (
                <div className="text-xs text-red-300">
                  Tab Switches: <span className="font-bold">{violations.tabSwitch}</span>
                </div>
              )}
              {violations.copyPaste > 0 && (
                <div className="text-xs text-red-300">
                  Copy/Paste: <span className="font-bold">{violations.copyPaste}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CodingTestInterface;
