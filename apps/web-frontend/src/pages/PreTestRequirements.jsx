import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PreTestRequirements = () => {
  const navigate = useNavigate();
  const { topicId, difficulty } = useParams();
  const [requirements, setRequirements] = useState({
    fullScreen: false,
    webcam: false,
    microphone: false,
    identity: false
  });

  useEffect(() => {
    // Check initial requirements
    checkRequirements();
  }, []);

  const checkRequirements = async () => {
    try {
      // Check webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setRequirements(prev => ({ ...prev, webcam: true }));
      stream.getTracks().forEach(track => track.stop());

      // Check microphone access
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRequirements(prev => ({ ...prev, microphone: true }));
      audioStream.getTracks().forEach(track => track.stop());

      // Check full screen capability
      setRequirements(prev => ({ ...prev, fullScreen: true }));

      // Identity verification is manual
      setRequirements(prev => ({ ...prev, identity: true }));
    } catch (error) {
      console.error('Error checking requirements:', error);
    }
  };

  const allRequirementsMet = Object.values(requirements).every(req => req);

  const handleStartTest = () => {
    if (allRequirementsMet) {
      navigate(`/certifications/proctored/test/${topicId}/${difficulty}`);
    }
  };

  const handleBack = () => {
    navigate(`/certifications/proctored/setup/${topicId}/${difficulty}`);
  };

  const RequirementCard = ({ title, description, isMet, icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl p-4 border-2 ${
        isMet 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isMet ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          isMet ? 'bg-green-500' : 'bg-yellow-500'
        }`}>
          {isMet ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pre-Test Requirements</h1>
          <p className="text-slate-400">All requirements must be met to start the test</p>
        </div>

        {/* Requirements List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-6"
        >
          <div className="space-y-4">
            <RequirementCard
              title="Full Screen Mode"
              description="Test will run in full screen. Tab switching will be monitored."
              isMet={requirements.fullScreen}
              icon={
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
            />

            <RequirementCard
              title="Webcam Access"
              description="Your face will be monitored throughout the test."
              isMet={requirements.webcam}
              icon={
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              }
            />

            <RequirementCard
              title="Microphone Access"
              description="Environmental noise will be monitored."
              isMet={requirements.microphone}
              icon={
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              }
            />

            <RequirementCard
              title="Identity Verification"
              description="Your name will be verified before starting."
              isMet={requirements.identity}
              icon={
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-red-800 mb-2">Important Notice</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your exam will be proctored using AI monitoring</li>
                <li>• Tab switching will result in score deductions</li>
                <li>• Ensure you're in a quiet, well-lit environment</li>
                <li>• Any suspicious behavior will be flagged and may affect your certification</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleBack}
            className="bg-white text-blue-600 border-2 border-blue-200 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            Back
          </button>
          
          <button
            onClick={handleStartTest}
            disabled={!allRequirementsMet}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              allRequirementsMet
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreTestRequirements;
