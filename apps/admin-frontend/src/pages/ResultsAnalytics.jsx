import React, { useState } from 'react'
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react'

const ResultsAnalytics = () => {
  const [results] = useState([
    { id: 1, userName: 'John Doe', testName: 'React.js', score: 85, duration: 45, cheatingFlags: 0, status: 'Passed' },
    { id: 2, userName: 'Jane Smith', testName: 'Node.js', score: 72, duration: 52, cheatingFlags: 1, status: 'Passed' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Results & Analytics</h1>
          <p className="text-slate-400">Manage and analyze exam outcomes</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Download className="w-5 h-5" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-blue-400 mb-2">Average Score</div>
          <div className="text-3xl font-bold text-white">78.5%</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-green-400 mb-2">Pass Rate</div>
          <div className="text-3xl font-bold text-white">82%</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-yellow-400 mb-2">Total Exams</div>
          <div className="text-3xl font-bold text-white">156</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-red-400 mb-2">Flagged Incidents</div>
          <div className="text-3xl font-bold text-white">3</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Test</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Flags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-slate-700/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{result.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{result.testName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{result.score}%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    result.status === 'Passed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {result.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{result.cheatingFlags}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-400 hover:text-blue-300">
                    <FileText className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultsAnalytics

