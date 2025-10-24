import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/admin/metrics`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : undefined }
        })
        if (!res.ok) throw new Error('Failed to fetch admin metrics')
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError(e.message)
      }
    }
    fetchMetrics()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {!data ? (
        <p className="text-slate-300">Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm">Users</div>
              <div className="text-3xl text-white font-bold">{data.totals.users}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm">Courses</div>
              <div className="text-3xl text-white font-bold">{data.totals.courses}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm">Practice Problems</div>
              <div className="text-3xl text-white font-bold">{data.totals.problems}</div>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h2 className="text-white font-semibold mb-3">Quiz Activity (last 7 days)</h2>
            {data.recent_quiz_activity.length === 0 ? (
              <p className="text-slate-400">No quiz activity yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_quiz_activity.map(item => (
                  <div key={item._id} className="flex justify-between text-slate-200">
                    <span>{item._id}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h2 className="text-white font-semibold mb-3">Top Weak Topics</h2>
            {data.top_weak_topics.length === 0 ? (
              <p className="text-slate-400">No weak topic data yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.top_weak_topics.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-md border border-slate-600 bg-slate-900">
                    <div className="text-white font-medium">{t.topic_id}</div>
                    <div className="text-slate-400 text-sm">Mistakes: {t.mistakes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard


