import React from 'react';
import { Award, Shield, TrendingUp, CheckCircle2, Camera, Mic, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

export const CertificationLanding = ({ onStartCertification }) => {
  const features = [
    {
      icon: Shield,
      title: 'Proctored Testing',
      description: 'AI-powered monitoring ensures exam integrity with face detection and behavior tracking.',
    },
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Earn certificates that validate your skills and boost your professional profile.',
    },
    {
      icon: TrendingUp,
      title: 'Multiple Difficulty Levels',
      description: 'Choose from Easy, Medium, or Tough levels to match your expertise.',
    },
  ];

  const requirements = [
    { icon: Camera, label: 'Webcam Required', desc: 'For identity verification' },
    { icon: Mic, label: 'Microphone Active', desc: 'To monitor test environment' },
    { icon: Monitor, label: 'Full Screen Mode', desc: 'No tab switching allowed' },
  ];

  const stats = [
    { value: '10,000+', label: 'Certificates Issued' },
    { value: '95%', label: 'Pass Rate' },
    { value: '50+', label: 'Skill Topics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">LearnQuest Certifications</span>
            </div>
            <Badge variant="secondary" className="hidden md:inline-flex">
              Professional Certification Platform
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge variant="default" className="mb-4">
            Trusted by Industry Leaders
          </Badge>
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Validate Your Skills with
            <span className="block bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
              Professional Certifications
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Demonstrate your technical mastery through rigorous, proctored assessments. 
            Earn industry-recognized certificates that showcase your expertise.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="xl"
              variant="premium"
              onClick={onStartCertification}
              className="w-full sm:w-auto"
            >
              Start Certification
              <Award className="h-5 w-5" />
            </Button>
            <Button size="xl" variant="outline" className="w-full sm:w-auto">
              Browse Topics
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-6 text-center shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="mb-2 font-display text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-card/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose Our Certification
            </h2>
            <p className="text-lg text-muted-foreground">
              Advanced proctoring technology ensures fair and credible assessments
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-primary hover:scale-[1.02]">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card className="border-2 border-primary/20 shadow-primary">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <CheckCircle2 className="mr-2 inline-block h-6 w-6 text-success" />
                  System Requirements
                </CardTitle>
                <CardDescription className="text-base">
                  Ensure your setup meets these requirements for a smooth testing experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map((req, index) => {
                    const Icon = req.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{req.label}</div>
                          <div className="text-sm text-muted-foreground">{req.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 rounded-lg bg-warning/10 p-4 text-sm">
                  <strong className="text-warning">Important:</strong> Tab switching and environmental noise will be monitored and may affect your final score.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Get Certified?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of professionals who have validated their skills
          </p>
          <Button size="xl" variant="premium" onClick={onStartCertification}>
            Begin Your Assessment
            <Award className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};
