import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CertificationTopics = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    {
      id: 'react',
      name: 'React.js',
      category: 'Frontend',
      icon: '⚛️',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'Backend',
      icon: '🟢',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'python',
      name: 'Python',
      category: 'Programming',
      icon: '🐍',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'database',
      name: 'Database Design',
      category: 'Data',
      icon: '🗄️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'cloud',
      name: 'Cloud Computing',
      category: 'DevOps',
      icon: '☁️',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'ml',
      name: 'Machine Learning',
      category: 'AI/ML',
      icon: '🧠',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'security',
      name: 'Cybersecurity',
      category: 'Security',
      icon: '🛡️',
      color: 'from-gray-700 to-gray-800'
    },
    {
      id: 'uiux',
      name: 'UI/UX Design',
      category: 'Design',
      icon: '🎨',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  const handleContinue = () => {
    if (selectedTopic) {
      navigate(`/certifications/proctored/difficulty/${selectedTopic.id}`);
    }
  };

  const handleBack = () => {
    navigate('/certifications');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Certification Topic
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Select the technology or skill area you want to get certified in
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                selectedTopic?.id === topic.id 
                  ? 'border-blue-500 ring-2 ring-blue-500/50' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => handleTopicSelect(topic)}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r ${topic.color} flex items-center justify-center text-2xl text-white`}>
                  {topic.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{topic.name}</h3>
                <span className="inline-block bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                  {topic.category}
                </span>
              </div>
            </motion.div>
          ))}
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
            onClick={handleContinue}
            disabled={!selectedTopic}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedTopic
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Continue to Difficulty Level →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificationTopics;
