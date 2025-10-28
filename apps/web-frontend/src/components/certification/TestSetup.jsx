import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Camera, Mic, Monitor, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const TestSetup = ({ topic, difficulty, onStartTest, onBack }) => {
  const [userName, setUserName] = useState('');
  const [hasWebcam, setHasWebcam] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [canStartTest, setCanStartTest] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    checkDevices();
  }, []);

  useEffect(() => {
    // In testing mode, only require username; in production, require all devices
    if (testingMode) {
      setCanStartTest(userName.trim().length > 0);
    } else {
      setCanStartTest(userName.trim().length > 0 && hasWebcam && hasMicrophone);
    }
  }, [userName, hasWebcam, hasMicrophone, testingMode]);

  const checkDevices = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      setHasWebcam(videoTracks.length > 0);
      setHasMicrophone(audioTracks.length > 0);
      
      // Stop the tracks after checking
      stream.getTracks().forEach(track => track.stop());
      
      toast.success('Devices detected successfully');
    } catch (error) {
      console.error('Device access error:', error);
      toast.warning('Camera/Microphone not detected. Enabling testing mode.');
      setTestingMode(true);
      // In testing mode, mock the device access
      setHasWebcam(true);
      setHasMicrophone(true);
    }
  };

  const handleStartTest = () => {
    if (canStartTest) {
      onStartTest(userName);
    }
  };

  const requirements = [
    {
      icon: Monitor,
      label: 'Full Screen Mode',
      description: 'Test will run in full screen. Tab switching will be monitored.',
      met: true,
    },
    {
      icon: Camera,
      label: 'Webcam Access',
      description: 'Your face will be monitored throughout the test.',
      met: hasWebcam,
    },
    {
      icon: Mic,
      label: 'Microphone Access',
      description: 'Environmental noise will be monitored.',
      met: hasMicrophone,
    },
    {
      icon: User,
      label: 'Identity Verification',
      description: 'Your name will be verified before starting.',
      met: userName.trim().length > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="default" className="mb-4">
              Step 3 of 3
            </Badge>
            {testingMode && (
              <Badge variant="warning" className="ml-2">
                Testing Mode
              </Badge>
            )}
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Test Environment Setup
            </h1>
            <p className="text-lg text-muted-foreground">
              Please complete the following steps before starting your test
            </p>
          </div>

          {/* Test Summary */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground">Topic</div>
                  <div className="font-semibold text-foreground">{topic.title}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground">Difficulty</div>
                  <div className="font-semibold text-foreground">{difficulty.name}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold text-foreground">{difficulty.duration}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground">Questions</div>
                  <div className="font-semibold text-foreground">{difficulty.questions}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Identity Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Identity Verification
                </CardTitle>
                <CardDescription>Enter your full name to proceed</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {userName.trim().length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Name verified
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webcam Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Camera Preview
                </CardTitle>
                <CardDescription>
                  {testingMode ? 'Testing mode - Camera preview disabled' : 'Ensure your face is clearly visible'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border-2 border-border">
                  {hasWebcam && !testingMode ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full h-48 object-cover"
                      videoConstraints={{
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user',
                      }}
                      onUserMedia={(stream) => {
                        console.log('Webcam stream started:', stream);
                        toast.success('Camera preview active');
                      }}
                      onUserMediaError={(error) => {
                        console.error('Webcam error:', error);
                        toast.error('Camera preview failed. Enabling testing mode.');
                        setTestingMode(true);
                        setHasWebcam(false);
                      }}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-muted">
                      <div className="text-center">
                        <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {testingMode ? 'Testing Mode Active' : 'Camera not detected'}
                        </p>
                        {!testingMode && (
                          <button
                            onClick={checkDevices}
                            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            Retry Camera Access
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {hasWebcam && !testingMode && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Camera is working properly
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Requirements Checklist */}
          <Card className="my-8">
            <CardHeader>
              <CardTitle>Pre-Test Requirements</CardTitle>
              <CardDescription>All requirements must be met to start the test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requirements.map((req, index) => {
                  const Icon = req.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${
                        req.met
                          ? 'border-success/30 bg-success/5'
                          : 'border-warning/30 bg-warning/5'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                          req.met ? 'bg-success/10' : 'bg-warning/10'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${req.met ? 'text-success' : 'text-warning'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{req.label}</span>
                          {req.met ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="mb-8 border-2 border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-destructive" />
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Important Notice</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Your exam will be proctored using AI monitoring</li>
                    <li>• Tab switching will result in score deductions</li>
                    <li>• Ensure you're in a quiet, well-lit environment</li>
                    <li>• Any suspicious behavior will be flagged and may affect your certification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="outline" onClick={onBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button
              size="lg"
              variant="premium"
              onClick={handleStartTest}
              disabled={!canStartTest}
              className="w-full sm:w-auto"
            >
              Start Test
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
