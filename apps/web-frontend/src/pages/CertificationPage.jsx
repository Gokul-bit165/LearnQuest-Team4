import React, { useState, useEffect } from 'react';
import { CertificationLanding } from '../components/certification/CertificationLanding';
import { TopicSelection } from '../components/certification/TopicSelection';
import { DifficultySelection } from '../components/certification/DifficultySelection';
import { TestSetup } from '../components/certification/TestSetup';
import { TestInterface } from '../components/certification/TestInterface';
import { TestResults } from '../components/certification/TestResults';

const CertificationPage = () => {
  const [step, setStep] = useState('landing');
  const [certifications, setCertifications] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userName, setUserName] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [finalTestData, setFinalTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (step === 'topic-selection') {
      fetchCertifications();
    }
  }, [step]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certifications');
      }

      const data = await response.json();
      setCertifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCertification = () => {
    setStep('topic-selection');
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setStep('difficulty-selection');
  };

  const handleSelectDifficulty = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setStep('test-setup');
  };

  const handleStartTest = async (name) => {
    try {
      setLoading(true);
      setUserName(name);

      const response = await fetch('/api/certifications/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          spec_id: selectedTopic._id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start test');
      }

      const data = await response.json();
      setAttemptId(data.attempt_id);
      setTestQuestions(data.questions);
      setStep('test');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = (testData) => {
    setFinalTestData(testData);
    setStep('results');
  };

  const handleReturnHome = () => {
    // Reset all state
    setStep('landing');
    setSelectedTopic(null);
    setSelectedDifficulty(null);
    setUserName('');
    setAttemptId(null);
    setTestQuestions([]);
    setFinalTestData(null);
    setError(null);
  };

  const handleBack = () => {
    switch (step) {
      case 'topic-selection':
        setStep('landing');
        break;
      case 'difficulty-selection':
        setStep('topic-selection');
        break;
      case 'test-setup':
        setStep('difficulty-selection');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button
            onClick={() => setError(null)}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {step === 'landing' && (
        <CertificationLanding onStartCertification={handleStartCertification} />
      )}
      
      {step === 'topic-selection' && (
        <TopicSelection
          certifications={certifications}
          onSelectTopic={handleSelectTopic}
          onBack={handleBack}
        />
      )}
      
      {step === 'difficulty-selection' && selectedTopic && (
        <DifficultySelection
          topic={selectedTopic}
          onSelectDifficulty={handleSelectDifficulty}
          onBack={handleBack}
        />
      )}
      
      {step === 'test-setup' && selectedTopic && selectedDifficulty && (
        <TestSetup
          topic={selectedTopic}
          difficulty={selectedDifficulty}
          onStartTest={handleStartTest}
          onBack={handleBack}
        />
      )}
      
      {step === 'test' && selectedTopic && selectedDifficulty && testQuestions.length > 0 && (
        <TestInterface
          topic={selectedTopic}
          difficulty={selectedDifficulty}
          userName={userName}
          testQuestions={testQuestions}
          attemptId={attemptId}
          onTestComplete={handleTestComplete}
        />
      )}
      
      {step === 'results' && selectedTopic && selectedDifficulty && finalTestData && (
        <TestResults
          topic={selectedTopic}
          difficulty={selectedDifficulty}
          userName={userName}
          testData={finalTestData}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
};

export default CertificationPage;
