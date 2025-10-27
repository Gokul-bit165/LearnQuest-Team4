import React, { useState } from 'react';
import { ChevronRight, Code2, Database, Cloud, Brain, Shield, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

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

export const TopicSelection = ({ certifications, onSelectTopic, onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleContinue = () => {
    if (selectedTopic) {
      onSelectTopic(selectedTopic);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="default" className="mb-4">
              Step 1 of 3
            </Badge>
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Choose Your Certification Topic
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a topic to test your knowledge and earn a professional certificate
            </p>
          </div>

          {/* Topics Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert, index) => {
              const topic = TOPICS.find(t => t.name.toLowerCase().includes(cert.title.toLowerCase())) || 
                           TOPICS.find(t => t.level.toLowerCase().includes(cert.title.toLowerCase())) ||
                           { id: cert._id, name: cert.title, icon: Code2, color: 'from-blue-500 to-cyan-500', level: cert.difficulty };
              const Icon = topic.icon;
              const isSelected = selectedTopic?.id === cert._id;
              
              return (
                <motion.div
                  key={cert._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isSelected
                        ? 'border-2 border-primary shadow-primary'
                        : 'border border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTopic(cert)}
                  >
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${topic.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {isSelected && (
                          <Badge variant="success">Selected</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{cert.title}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {cert.difficulty}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{cert.duration_minutes} min</span>
                        <span>{cert.pass_percentage}% to pass</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Topic Summary */}
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${topic.color}`}>
                      <topic.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Selected Topic</div>
                      <div className="text-lg font-bold text-primary">{selectedTopic.title}</div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-base">
                    {selectedTopic.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="outline" onClick={onBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button
              size="lg"
              variant="premium"
              onClick={handleContinue}
              disabled={!selectedTopic}
              className="w-full sm:w-auto"
            >
              Continue to Difficulty Level
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
