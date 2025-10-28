import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Clock, Eye, Volume2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import Webcam from 'react-webcam';
import screenfull from 'screenfull';
import { toast } from 'sonner';
import { formatTime } from '../../lib/utils';

export const TestInterface = ({ topic, difficulty, userName, testQuestions, attemptId, onTestComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(difficulty.questions * 60); // 1 minute per question
  const [violations, setViolations] = useState({
    tabSwitch: 0,
    faceNotDetected: 0,
    noiseDetected: 0,
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    // Enter fullscreen
    if (screenfull.isEnabled) {
      screenfull.request();
      setIsFullScreen(true);
    }

    // Listen for visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
        toast.error('Tab switching detected! This will affect your score.');
        
        // Log the violation to the API
        if (attemptId) {
          logEvent({ type: 'tab_switch' });
        }
      }
    };

    // Prevent common keyboard shortcuts for tab/window switching
    const handleKeyDown = (e) => {
      // Prevent Ctrl+Tab, Alt+Tab, etc.
      if ((e.ctrlKey || e.altKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        toast.error('Tab switching is not allowed during the test!');
        setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
        logEvent({ type: 'tab_switch_attempt', method: e.ctrlKey ? 'Ctrl+Tab' : 'Alt+Tab' });
      }
      
      // Prevent F11 and other system keys
      if (e.key === 'F11' || e.key === 'F12') {
        e.preventDefault();
        toast.error('This action is not allowed during the test!');
      }
      
      // Prevent Ctrl+W, Ctrl+N, Ctrl+T (window/tab management)
      if ((e.ctrlKey || e.metaKey) && ['w', 'n', 't'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast.error('Window management shortcuts are disabled!');
        setViolations(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warning('Right-click is disabled during the test');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && screenfull.isEnabled) {
        toast.warning('Please remain in fullscreen mode');
        // Try to re-enter fullscreen
        screenfull.request().catch(() => {
          toast.error('Unable to re-enter fullscreen. Test may be terminated.');
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (screenfull.isEnabled && screenfull.isFullscreen) {
        screenfull.exit();
      }
    };
  }, [attemptId]);

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const logEvent = async (event) => {
    try {
      const response = await fetch('/api/certifications/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          event: event
        })
      });

      if (!response.ok) {
        console.error('Failed to log event');
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  };

  const proctorImage = async (imageBase64) => {
    try {
      const response = await fetch('/api/ai/proctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          image_base64: imageBase64
        })
      });

      if (!response.ok) {
        console.error('Failed to proctor image');
      }
    } catch (error) {
      console.error('Error proctoring image:', error);
    }
  };

  useEffect(() => {
    // Proctoring interval - capture image every 10 seconds
    const proctoringInterval = setInterval(() => {
      if (webcamRef.current && !document.hidden) {
        try {
          const imageBase64 = webcamRef.current.getScreenshot();
          if (imageBase64) {
            proctorImage(imageBase64);
          }
        } catch (error) {
          console.error('Error capturing screenshot:', error);
        }
      }
    }, 10000);

    return () => clearInterval(proctoringInterval);
  }, [attemptId]);

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: testQuestions[currentQuestion]._id,
      selectedAnswer: answerIndex,
      isCorrect: false, // Will be determined on submission
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (screenfull.isEnabled && screenfull.isFullscreen) {
      screenfull.exit();
    }

    try {
      const response = await fetch('/api/certifications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: answers.reduce((acc, answer) => {
            if (answer) {
              acc[answer.questionId] = answer.selectedAnswer;
            }
            return acc;
          }, {})
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      onTestComplete({ answers, violations, ...result });
    } catch (error) {
      toast.error('Failed to submit test');
      console.error('Submit error:', error);
    }
  };

  const progress = ((currentQuestion + 1) / testQuestions.length) * 100;
  const currentQ = testQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - Monitoring Status */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="default">{topic.title}</Badge>
              <Badge variant="outline">{difficulty.name}</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Monitoring Indicators */}
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-success" />
                <span className="hidden sm:inline">Monitored</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Volume2 className="h-4 w-4 text-success" />
                <span className="hidden sm:inline">Listening</span>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono font-semibold text-primary">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content - Questions */}
          <div className="lg:col-span-2">
            {/* Progress */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">
                  Question {currentQuestion + 1} of {testQuestions.length}
                </span>
                <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} max={100} />
            </div>

            {/* Question Card */}
            <Card className="mb-6">
              <CardContent className="p-8">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  {currentQ.title || currentQ.problem_statement}
                </h2>
                <div className="space-y-3">
                  {currentQ.options?.map((option, index) => {
                    const isSelected = answers[currentQuestion]?.selectedAnswer === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-primary'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                          </div>
                          <span className="text-foreground">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion === testQuestions.length - 1 ? (
                <Button variant="premium" size="lg" onClick={handleSubmitTest}>
                  Submit Test
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleNext}
                  disabled={!answers[currentQuestion]}
                >
                  Next Question
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Webcam Monitor */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Eye className="h-4 w-4 text-primary" />
                  Proctoring Active
                </h3>
                <div className="overflow-hidden rounded-lg border-2 border-border">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {testQuestions.map((_, index) => {
                    const isAnswered = answers[index] !== undefined;
                    const isCurrent = index === currentQuestion;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all ${
                          isCurrent
                            ? 'border-primary bg-primary text-white'
                            : isAnswered
                            ? 'border-success bg-success/10 text-success'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Violations */}
            {(violations.tabSwitch > 0 || violations.faceNotDetected > 0 || violations.noiseDetected > 0) && (
              <Card className="border-2 border-warning/30 bg-warning/5">
                <CardContent className="p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
                    <AlertCircle className="h-4 w-4" />
                    Violations Detected
                  </h3>
                  <div className="space-y-2 text-sm">
                    {violations.tabSwitch > 0 && (
                      <div className="flex justify-between">
                        <span>Tab Switches:</span>
                        <span className="font-semibold">{violations.tabSwitch}</span>
                      </div>
                    )}
                    {violations.faceNotDetected > 0 && (
                      <div className="flex justify-between">
                        <span>Face Not Detected:</span>
                        <span className="font-semibold">{violations.faceNotDetected}</span>
                      </div>
                    )}
                    {violations.noiseDetected > 0 && (
                      <div className="flex justify-between">
                        <span>Noise Detected:</span>
                        <span className="font-semibold">{violations.noiseDetected}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold">Test Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Candidate:</span>
                    <span className="font-semibold">{userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Answered:</span>
                    <span className="font-semibold">
                      {answers.length}/{testQuestions.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
