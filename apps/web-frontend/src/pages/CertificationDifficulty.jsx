import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const CertificationDifficulty = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const difficulties = [
    {
      id: 'easy',
      name: 'Easy',
      description: 'Fundamental concepts and basic questions',
      duration: '30 minutes',
      questions: 20,
      passingScore: 70,
      icon: '⚡',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500'
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Intermediate knowledge and practical scenarios',
      duration: '45 minutes',
      questions: 30,
      passingScore: 75,
      icon: '📈',
      color: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      id: 'hard',
      name: 'Tough',
      description: 'Advanced topics and complex problem-solving',
      duration: '60 minutes',
      questions: 40,
      passingScore: 85,
      icon: '🔥',
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-500'
    }
  ];

  const selectedDifficultyData = difficulties.find(d => d.id === selectedDifficulty);

  const handleContinue = () => {
    navigate(`/certifications/proctored/setup/${topicId}/${selectedDifficulty}`);
  };

  const handleBack = () => {
    navigate('/certifications/proctored/topics');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Select Difficulty Level
          </h1>
          <p className="text-lg text-slate-400">
            Choose the difficulty level that matches your skill level
          </p>
        </div>

        {/* Difficulty Cards */}
        <div className="space-y-6 mb-12">
          {difficulties.map((difficulty, index) => (
            <motion.div
              key={difficulty.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                selectedDifficulty === difficulty.id 
                  ? `${difficulty.borderColor} ring-2 ring-opacity-50` 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedDifficulty(difficulty.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${difficulty.color} flex items-center justify-center text-white text-xl`}>
                    {difficulty.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-white">{difficulty.name}</h3>
                      {selectedDifficulty === difficulty.id && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400">{difficulty.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-white">{difficulty.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Questions:</span>
                      <span className="font-semibold text-white">{difficulty.questions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passing Score:</span>
                      <span className="font-semibold text-white">{difficulty.passingScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Level Summary */}
        {selectedDifficultyData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800 border border-blue-500 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${selectedDifficultyData.color} flex items-center justify-center text-white text-xl`}>
                  {selectedDifficultyData.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-400">You've Selected</p>
                  <h3 className="text-xl font-bold text-white">{selectedDifficultyData.name} Level</h3>
                  <p className="text-sm text-slate-400">
                    {selectedDifficultyData.questions} questions • {selectedDifficultyData.duration}
                  </p>
                </div>
              </div>
              <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                {selectedDifficultyData.passingScore}% to pass
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleBack}
            className="bg-slate-800 text-white border-2 border-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
          >
            Back
          </button>
          
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue to Setup →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificationDifficulty;
