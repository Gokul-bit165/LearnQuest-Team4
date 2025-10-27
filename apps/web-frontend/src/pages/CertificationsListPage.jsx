import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Award, Clock, Users, CheckCircle } from 'lucide-react';

const CertificationsListPage = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await api.get('/api/certifications/');
      setCertifications(response.data);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Tough':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Certifications</h1>
          <p className="text-slate-400 text-lg">
            Earn industry-recognized certifications by completing proctored tests
          </p>
        </div>

        {/* Certifications Grid */}
        {certifications.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              No certifications available at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(cert.difficulty)}`}>
                    {cert.difficulty}
                  </span>
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {cert.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{cert.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{cert.pass_percentage}% to pass</span>
                  </div>
                </div>

                <Link
                  to={`/certifications/test/${cert.id}`}
                  className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Start Test
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CertificationsListPage;
