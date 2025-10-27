import React, { useState } from 'react';
import { ChevronRight, Zap, TrendingUp, Flame } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

const DIFFICULTY_LEVELS = [
  {
    id: 'easy',
    name: 'Easy',
    icon: Zap,
    description: 'Fundamental concepts and basic questions',
    duration: '30 minutes',
    questions: 20,
    color: 'from-green-500 to-emerald-500',
    passingScore: 70,
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: TrendingUp,
    description: 'Intermediate knowledge and practical scenarios',
    duration: '45 minutes',
    questions: 30,
    color: 'from-yellow-500 to-orange-500',
    passingScore: 75,
  },
  {
    id: 'tough',
    name: 'Tough',
    icon: Flame,
    description: 'Advanced topics and complex problem-solving',
    duration: '60 minutes',
    questions: 40,
    color: 'from-red-500 to-rose-500',
    passingScore: 85,
  },
];

export const DifficultySelection = ({ topic, onSelectDifficulty, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleContinue = () => {
    if (selectedLevel) {
      onSelectDifficulty(selectedLevel);
    }
  };

  // Map certification difficulty to our levels
  const getDifficultyLevel = (certDifficulty) => {
    switch (certDifficulty.toLowerCase()) {
      case 'easy': return DIFFICULTY_LEVELS[0];
      case 'medium': return DIFFICULTY_LEVELS[1];
      case 'tough': return DIFFICULTY_LEVELS[2];
      default: return DIFFICULTY_LEVELS[0];
    }
  };

  const mappedLevel = getDifficultyLevel(topic.difficulty);

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
              Step 2 of 3
            </Badge>
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Select Difficulty Level
            </h1>
            <p className="text-lg text-muted-foreground">
              Testing for <span className="font-semibold text-primary">{topic.title}</span>
            </p>
          </div>

          {/* Difficulty Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {DIFFICULTY_LEVELS.map((level, index) => {
              const Icon = level.icon;
              const isSelected = selectedLevel?.id === level.id;
              
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card
                    className={`flex h-full cursor-pointer flex-col transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isSelected
                        ? 'border-2 border-primary shadow-primary'
                        : 'border border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedLevel(level)}
                  >
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${level.color}`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        {isSelected && (
                          <Badge variant="success">Selected</Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{level.name}</CardTitle>
                      <CardDescription className="text-base">{level.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold text-foreground">{level.duration}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                          <span className="text-muted-foreground">Questions:</span>
                          <span className="font-semibold text-foreground">{level.questions}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                          <span className="text-muted-foreground">Passing Score:</span>
                          <span className="font-semibold text-foreground">{level.passingScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Level Summary */}
          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${selectedLevel.color}`}>
                      <selectedLevel.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground">You've Selected</div>
                      <div className="text-2xl font-bold text-primary">{selectedLevel.name} Level</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedLevel.questions} questions • {selectedLevel.duration}
                      </div>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-sm">
                    {selectedLevel.passingScore}% to pass
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
              disabled={!selectedLevel}
              className="w-full sm:w-auto"
            >
              Continue to Setup
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
