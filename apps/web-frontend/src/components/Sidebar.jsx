import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  LogOut,
  Star,
  Zap,
  Bot,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI } from '../services/api';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
  ];

  // Fetch course data when on a course page
  useEffect(() => {
    const fetchCurrentCourse = async () => {
      if (location.pathname.startsWith('/courses/') && location.pathname !== '/courses') {
        const slug = location.pathname.split('/courses/')[1];
        setLoadingCourse(true);
        try {
          const response = await coursesAPI.getCourseBySlug(slug);
          setCurrentCourse(response.data);
        } catch (error) {
          console.error('Error fetching course:', error);
          setCurrentCourse(null);
        } finally {
          setLoadingCourse(false);
        }
      } else {
        setCurrentCourse(null);
      }
    };

    fetchCurrentCourse();
  }, [location.pathname]);

  // Determine AI Tutor link based on current location
  const getAITutorLink = () => {
    // If we have course data, use the actual course ID
    if (currentCourse && currentCourse.id) {
      return `/tutor/${currentCourse.id}`;
    }
    return null; // No specific course context
  };

  const aiTutorLink = getAITutorLink();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LearnQuest</h1>
            <p className="text-xs text-slate-400">Level up your skills</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        {/* AI Tutor Link */}
        {loadingCourse ? (
          <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-400">
            <Bot className="w-5 h-5 mr-3" />
            AI Tutor
            <span className="ml-auto text-xs bg-slate-600 text-slate-400 px-2 py-1 rounded-full">
              Loading...
            </span>
          </div>
        ) : aiTutorLink ? (
          <Link
            to={aiTutorLink}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive(aiTutorLink)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg'
            }`}
          >
            <Bot className="w-5 h-5 mr-3" />
            AI Tutor
            <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-semibold">
              AI
            </span>
          </Link>
        ) : (
          <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-500 cursor-not-allowed">
            <Bot className="w-5 h-5 mr-3" />
            AI Tutor
            <span className="ml-auto text-xs bg-slate-600 text-slate-400 px-2 py-1 rounded-full">
              Select Course
            </span>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              Level {user?.level || 1}
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>XP Progress</span>
            <span>{user?.xp || 0} XP</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((user?.xp || 0) % 1000) / 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
