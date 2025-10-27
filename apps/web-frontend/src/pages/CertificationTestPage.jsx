import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificationTest from '../components/certification/CertificationTest';
import api from '../services/api';
import { toast } from 'sonner';

const CertificationTestPage = () => {
  const { certificationId } = useParams();
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    startTest();
  }, []);

  const startTest = async () => {
    try {
      // Start the test first
      const response = await api.post('/api/certifications/start', {
        spec_id: certificationId
      });

      setAttemptData(response.data);
      setShowConsent(true);
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test. Please try again.');
      navigate('/certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConsent = () => {
    setConsentAccepted(true);
    setShowConsent(false);
  };

  const handleRejectConsent = () => {
    toast.error('Camera and microphone access is required for the test.');
    navigate('/certifications');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">Initializing test...</div>
        </div>
      </div>
    );
  }

  // Consent Modal
  if (showConsent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Test Proctoring Consent</h2>
            <p className="text-gray-600 mb-6">
              Before starting your certification test, please review the following information about our proctoring system.
            </p>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Camera & Microphone Access</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Your camera will monitor your environment to ensure test integrity</li>
                <li>Your microphone will detect audio anomalies</li>
                <li>AI-based face detection ensures you are present during the test</li>
                <li>Object detection monitors for phones or other unauthorized devices</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Monitoring & Behavior Tracking</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Tab switches and window focus changes are detected</li>
                <li>Fullscreen mode is required during the test</li>
                <li>Copy, paste, and screenshot attempts are logged</li>
                <li>Behavior score is calculated based on compliance</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data & Privacy</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Images are processed in real-time and not stored permanently</li>
                <li>Evidence screenshots are kept for 30 days for review purposes</li>
                <li>Only authorized admins can access proctoring logs</li>
                <li>No personal identification is shared outside the platform</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Important Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Ensure good lighting and face visibility</li>
                <li>Keep your face centered in the camera frame</li>
                <li>Do not use your phone or other devices during the test</li>
                <li>Avoid looking away from the screen frequently</li>
                <li>Stay in a quiet environment to minimize audio disruptions</li>
              </ul>
            </section>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> A poor behavior score due to violations may affect your final certification score. 
                The test is designed to ensure fairness and integrity.
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleRejectConsent}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptConsent}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              I Accept & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!consentAccepted || !attemptData) {
    return null;
  }

  return (
    <CertificationTest 
      attemptData={attemptData} 
      questions={attemptData.questions}
    />
  );
};

export default CertificationTestPage;
