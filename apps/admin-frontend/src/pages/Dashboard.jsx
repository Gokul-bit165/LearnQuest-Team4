import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Award, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Target
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCertifications: 0,
    totalCourses: 0,
    totalQuestions: 0,
    recentAttempts: 0,
    passRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch multiple endpoints in parallel
      const [usersRes, certsRes, coursesRes, questionsRes, attemptsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/certifications/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/courses/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/problems/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/attempts/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      const [users, certs, courses, questions, attempts] = await Promise.all([
        usersRes.ok ? usersRes.json() : [],
        certsRes.ok ? certsRes.json() : [],
        coursesRes.ok ? coursesRes.json() : [],
        questionsRes.ok ? questionsRes.json() : [],
        attemptsRes.ok ? attemptsRes.json() : []
      ])

      const passRate = attempts.length > 0 
        ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
        : 0

      setStats({
        totalUsers: users.length,
        totalCertifications: certs.length,
        totalCourses: courses.length,
        totalQuestions: questions.length,
        recentAttempts: attempts.filter(a => {
          const attemptDate = new Date(a.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return attemptDate > weekAgo
        }).length,
        passRate
      })

      // Set recent activity (last 10 attempts)
      setRecentActivity(attempts.slice(0, 10))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Certifications',
      value: stats.totalCertifications,
      icon: Award,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Questions',
      value: stats.totalQuestions,
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      title: 'Recent Attempts',
      value: stats.recentAttempts,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      title: 'Pass Rate',
      value: `${stats.passRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of your LearnQuest platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border ${stat.borderColor} ${stat.bgColor} hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className={`p-2 rounded-full ${activity.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {activity.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {activity.user_name} {activity.passed ? 'passed' : 'failed'} {activity.certification_title}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{activity.score}%</p>
                    <p className="text-slate-400 text-xs">Score</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Create New Certification</p>
                  <p className="text-slate-400 text-sm">Add a new certification track</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Manage Questions</p>
                  <p className="text-slate-400 text-sm">Add or edit questions</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">View Users</p>
                  <p className="text-slate-400 text-sm">Manage user accounts</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard