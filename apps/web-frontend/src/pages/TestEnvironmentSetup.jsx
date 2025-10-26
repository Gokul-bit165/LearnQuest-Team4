import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const TestEnvironmentSetup = () => {
  const navigate = useNavigate();
  const { topicId, difficulty } = useParams();
  const [fullName, setFullName] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

  const difficultyData = {
    'easy': { duration: '30 minutes', questions: 20 },
    'medium': { duration: '45 minutes', questions: 30 },
    'hard': { duration: '60 minutes', questions: 40 }
  };

  const topicName = topicNames[topicId] || topicId;
  const testData = difficultyData[difficulty] || { duration: '30 minutes', questions: 20 };

  useEffect(() => {
    // Request camera and microphone access
    requestMediaAccess();
    
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestMediaAccess = async () => {
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
        setMicrophoneActive(true);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Error accessing camera/microphone. Please check permissions.');
      setCameraActive(false);
      setMicrophoneActive(false);
    }
  };

  const handleStartTest = async () => {
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }

    if (!cameraActive) {
      alert('Please enable camera access to continue');
      return;
    }

    setIsLoading(true);
    
    // Navigate to the actual test
    setTimeout(() => {
      navigate(`/certification/test/${topicId}/${difficulty}`);
    }, 1000);
  };

  const handleBack = () => {
    navigate(`/certification/difficulty/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Environment Setup</h1>
          <p className="text-slate-400">Please complete the following steps before starting your test</p>
        </div>

        {/* Test Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800 rounded-xl p-6 shadow-lg mb-6 border border-slate-700"
        >
          <h2 className="text-xl font-bold text-white mb-4">Test Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-sm text-slate-400 mb-1">Topic</p>
              <p className="font-semibold text-white">{topicName}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-sm text-slate-400 mb-1">Difficulty</p>
              <p className="font-semibold text-white capitalize">{difficulty}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-sm text-slate-400 mb-1">Duration</p>
              <p className="font-semibold text-white">{testData.duration}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-sm text-slate-400 mb-1">Questions</p>
              <p className="font-semibold text-white">{testData.questions}</p>
            </div>
          </div>
        </motion.div>

        {/* Setup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Identity Verification */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Identity Verification</h3>
            </div>
            <p className="text-slate-400 mb-4">Enter your full name to proceed</p>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
            />
          </motion.div>

          {/* Camera Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Camera Preview</h3>
            </div>
            <p className="text-slate-400 mb-4">Ensure your face is clearly visible</p>
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
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleBack}
            className="bg-slate-800 text-white border-2 border-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
          >
            Back
          </button>
          
          <button
            onClick={handleStartTest}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isLoading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? 'Starting Test...' : 'Start Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestEnvironmentSetup;
