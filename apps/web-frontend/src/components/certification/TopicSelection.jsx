import React, { useState, useEffect } from 'react';
import { ChevronRight, Code2, Database, Cloud, Brain, Shield, Palette, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import certificationService from '../../services/certificationService';

const TOPICS = [
  { id: 'react', name: 'React.js', icon: Code2, color: 'from-blue-500 to-cyan-500', level: 'Frontend' },
  { id: 'nodejs', name: 'Node.js', icon: Code2, color: 'from-green-500 to-emerald-500', level: 'Backend' },
  { id: 'python', name: 'Python', icon: Code2, color: 'from-yellow-500 to-orange-500', level: 'Programming' },
  { id: 'database', name: 'Database Design', icon: Database, color: 'from-purple-500 to-pink-500', level: 'Data' },
  { id: 'cloud', name: 'Cloud Computing', icon: Cloud, color: 'from-indigo-500 to-blue-500', level: 'DevOps' },
  { id: 'ml', name: 'Machine Learning', icon: Brain, color: 'from-red-500 to-rose-500', level: 'AI/ML' },
  { id: 'security', name: 'Cybersecurity', icon: Shield, color: 'from-gray-600 to-gray-800', level: 'Security' },
  { id: 'design', name: 'UI/UX Design', icon: Palette, color: 'from-pink-500 to-violet-500', level: 'Design' },
];

const TopicSelection = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const data = await certificationService.getCertifications();
      setCertifications(data);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      // Fallback to mock data
      setCertifications([
        { _id: '1', title: 'React.js', description: 'Frontend development certification', difficulty: 'Medium', duration_minutes: 60, pass_percentage: 70 },
        { _id: '2', title: 'Node.js', description: 'Backend development certification', difficulty: 'Hard', duration_minutes: 90, pass_percentage: 75 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedTopic) {
      navigate(`/certification/difficulty/${selectedTopic._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-2 text-blue-300 text-sm font-medium border border-blue-500/30">
              Step 1 of 3
            </div>
            <h1 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Choose Your Certification Topic
            </h1>
            <p className="text-lg text-slate-400">
              Select a topic to test your knowledge and earn a professional certificate
            </p>
          </div>

          {/* Topics Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <div className="text-slate-500 text-lg">No certifications available</div>
                <div className="text-slate-400 text-sm">Check back later for new certification tracks</div>
              </div>
            ) : (
              certifications.map((cert, index) => {
                const topic = TOPICS.find(t => t.name.toLowerCase().includes(cert.title.toLowerCase())) || 
                             TOPICS.find(t => t.level.toLowerCase().includes(cert.title.toLowerCase())) ||
                             { id: cert._id, name: cert.title, icon: Code2, color: 'from-blue-500 to-cyan-500', level: cert.difficulty };
                const Icon = topic.icon;
                const isSelected = selectedTopic?._id === cert._id;
                
                return (
                  <motion.div
                    key={cert._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div
                      className={`cursor-pointer rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-slate-800/50 p-6 ${
                        isSelected
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'border-slate-700 hover:border-blue-400'
                      }`}
                      onClick={() => setSelectedTopic(cert)}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${topic.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {isSelected && (
                          <div className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">Selected</div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                      <div className="mb-2">
                        <div className="inline-block px-2 py-1 border border-blue-500 text-blue-400 text-xs font-medium rounded">
                          {cert.difficulty}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{cert.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{cert.duration_minutes} min</span>
                        <span>{cert.pass_percentage}% to pass</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Selected Topic Summary */}
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="rounded-xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${TOPICS.find(t => t.name.toLowerCase().includes(selectedTopic.title.toLowerCase()))?.color || 'from-blue-500 to-cyan-500'}`}>
                      <Award className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-400 text-sm">Selected Topic</div>
                      <div className="text-lg font-bold text-white">{selectedTopic.title}</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-blue-600 text-white text-lg font-bold rounded-lg">
                    {selectedTopic.difficulty}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={() => navigate('/certification')} 
              className="w-full sm:w-auto border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedTopic}
              className={`w-full sm:w-auto flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTopic
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue to Difficulty Level
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { TopicSelection };
export default TopicSelection;
