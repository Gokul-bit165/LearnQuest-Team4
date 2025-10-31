import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Video, VideoOff, Shield } from 'lucide-react';

/**
 * WebcamProctoring Component
 * Real-time AI proctoring with webcam monitoring
 * Sends frames via WebSocket, displays violations with red border
 */
const WebcamProctoring = ({ attemptId, onViolation }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [hasViolation, setHasViolation] = useState(false);
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    yaw: 0,
    pitch: 0,
    looking_away: false,
    phone_detected: false,
    multiple_people: false
  });
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionDenied(false);
      setError(null);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam. Please grant camera permissions.');
      setPermissionDenied(true);
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/proctoring/ws/${attemptId}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Proctoring WebSocket connected');
      setIsActive(true);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      
      if (response.status === 'success' && response.data) {
        const data = response.data;
        
        // Update stats
        setStats({
          yaw: data.yaw || 0,
          pitch: data.pitch || 0,
          looking_away: data.looking_away || false,
          phone_detected: data.phone_detected || false,
          multiple_people: data.multiple_people || false
        });
        
        // Handle violations
        if (data.has_violations && data.violations && data.violations.length > 0) {
          setHasViolation(true);
          setViolations(prev => [...data.violations, ...prev].slice(0, 10)); // Keep last 10
          
          // Notify parent component
          if (onViolation) {
            onViolation(data.violations);
          }
          
          // Clear violation flag after 3 seconds
          setTimeout(() => {
            setHasViolation(false);
          }, 3000);
        }
      } else if (response.status === 'error') {
        console.error('Proctoring error:', response.message);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Retrying...');
    };

    ws.onclose = () => {
      console.log('Proctoring WebSocket closed');
      setIsActive(false);
    };

    return ws;
  }, [attemptId, onViolation]);

  // Send frame to server
  const sendFrame = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const frameData = canvas.toDataURL('image/jpeg', 0.7);

    // Send via WebSocket
    wsRef.current.send(JSON.stringify({
      frame: frameData
    }));
  }, []);

  // Start proctoring
  const startProctoring = useCallback(async () => {
    await startWebcam();
    connectWebSocket();
    
    // Send frames every 1 second
    intervalRef.current = setInterval(sendFrame, 1000);
  }, [startWebcam, connectWebSocket, sendFrame]);

  // Stop proctoring
  const stopProctoring = useCallback(() => {
    // Stop sending frames
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Stop webcam
    stopWebcam();
    setIsActive(false);
  }, [stopWebcam]);

  // Auto-start on mount
  useEffect(() => {
    startProctoring();
    
    return () => {
      stopProctoring();
    };
  }, []);

  // Determine border color based on violations
  const getBorderColor = () => {
    if (hasViolation) return 'border-red-600';
    if (stats.looking_away || stats.phone_detected || stats.multiple_people) {
      return 'border-yellow-500';
    }
    return 'border-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Webcam Preview */}
      <div className="relative">
        <div className={`relative rounded-lg overflow-hidden border-4 ${getBorderColor()} transition-colors duration-300`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Status Overlay */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-lg">
              <Shield className={`w-4 h-4 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-white text-sm font-medium">
                {isActive ? 'Monitoring Active' : 'Inactive'}
              </span>
            </div>
            
            {hasViolation && (
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg animate-pulse">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">Violation Detected!</span>
              </div>
            )}
          </div>
          
          {/* Head Pose Stats */}
          {isActive && (
            <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-2 rounded-lg text-white text-xs space-y-1">
              <div>Yaw: {stats.yaw.toFixed(1)}°</div>
              <div>Pitch: {stats.pitch.toFixed(1)}°</div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            {permissionDenied && (
              <button
                onClick={startWebcam}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Retry Camera Access
              </button>
            )}
          </div>
        )}
      </div>

      {/* Violation Warnings */}
      <div className="space-y-2">
        {stats.looking_away && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800 text-sm">Looking away from screen</span>
          </div>
        )}
        
        {stats.phone_detected && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-800 text-sm font-medium">Prohibited object detected</span>
          </div>
        )}
        
        {stats.multiple_people && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-800 text-sm font-medium">Multiple people detected</span>
          </div>
        )}
      </div>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Violations</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {violations.map((v, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                <span className={`font-medium ${v.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {v.severity.toUpperCase()}
                </span>
                {' - '}
                {v.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamProctoring;
