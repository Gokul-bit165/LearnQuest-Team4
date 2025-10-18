import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Bot,
  Zap
} from 'lucide-react';

const TopNavigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">LearnQuest</h2>
            <p className="text-xs text-slate-400">Quick Access</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          
          <Link
            to="/courses"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/courses') || location.pathname.startsWith('/courses/')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </Link>
          
          <div className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-slate-500 cursor-not-allowed">
            <Bot className="w-4 h-4 mr-2" />
            AI Tutor
            <span className="ml-2 text-xs bg-slate-600 text-slate-400 px-2 py-1 rounded-full">
              Select Course
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs text-slate-400">Level 1 • 0 XP</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">U</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;