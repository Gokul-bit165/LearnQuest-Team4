import React, { useState, useEffect } from 'react'
import { Download, FileText, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { adminCertTestsAPI } from '../services/api'

const ResultsAnalytics = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await adminCertTestsAPI.getAllAttempts()
      setResults(response.data)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = async (attemptId) => {
    try {
      const response = await adminCertTestsAPI.getAttempt(attemptId)
      setSelectedAttempt(response.data)
      setShowDetails(true)
    } catch (error) {
      console.error('Error fetching attempt details:', error)
    }
  }

  const exportResults = () => {
    const csv = [
      ['User Name', 'Certification', 'Difficulty', 'Score', 'Status', 'Date', 'Violations', 'Eligible for Review', 'Feedback'].join(','),
      ...results.map(r => [
        r.user_name,
        r.cert_id,
        r.difficulty,
        r.score,
        r.status,
        new Date(r.created_at).toLocaleDateString(),
        r.proctoring_events_count,
        r.eligible_for_review ? 'Yes' : 'No',
        r.feedback ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-results-${new Date().toISOString()}.csv`
    a.click()
  }

  const stats = {
    averageScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1) : 0,
    passRate: results.length > 0 ? ((results.filter(r => r.score >= 85).length / results.length) * 100).toFixed(0) : 0,
    totalExams: results.length,
    flaggedIncidents: results.filter(r => r.proctoring_events_count > 5).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Results & Analytics</h1>
          <p className="text-slate-400">Manage and analyze exam outcomes</p>
        </div>
        <button 
          onClick={exportResults}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Download className="w-5 h-5" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-blue-400 mb-2">Average Score</div>
          <div className="text-3xl font-bold text-white">{stats.averageScore}%</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-green-400 mb-2">Pass Rate</div>
          <div className="text-3xl font-bold text-white">{stats.passRate}%</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-yellow-400 mb-2">Total Exams</div>
          <div className="text-3xl font-bold text-white">{stats.totalExams}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-red-400 mb-2">Flagged Incidents</div>
          <div className="text-3xl font-bold text-white">{stats.flaggedIncidents}</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Certification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Violations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {results.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-slate-400">
                  No test results found
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.attempt_id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{result.user_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{result.cert_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span className="capitalize">{result.difficulty}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{result.score}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${
                      result.score >= 85 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {result.score >= 85 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {result.score >= 85 ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`flex items-center gap-1 ${result.proctoring_events_count > 5 ? 'text-red-400' : 'text-slate-300'}`}>
                      {result.proctoring_events_count > 5 && <AlertTriangle className="w-4 h-4" />}
                      {result.proctoring_events_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      result.eligible_for_review ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'
                    }`}>
                      {result.eligible_for_review ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => viewDetails(result.attempt_id)}
                      className="text-blue-400 hover:text-blue-300"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetails && selectedAttempt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Test Attempt Details</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 text-sm mb-1">User Name</div>
                  <div className="text-white font-semibold">{selectedAttempt.user_name}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Certification</div>
                  <div className="text-white font-semibold">{selectedAttempt.topic_id}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Difficulty</div>
                  <div className="text-white font-semibold capitalize">{selectedAttempt.difficulty}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-1">Score</div>
                  <div className="text-white font-semibold text-2xl">{selectedAttempt.score}%</div>
                </div>
              </div>

              {/* Proctoring Events */}
              {selectedAttempt.proctoring_events && selectedAttempt.proctoring_events.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Proctoring Events ({selectedAttempt.proctoring_events.length})</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {selectedAttempt.proctoring_events.map((event, idx) => (
                      <div key={idx} className="mb-2 pb-2 border-b border-slate-600 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{event.type}</span>
                          <span className="text-slate-400 text-sm ml-auto">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        {event.message && (
                          <div className="text-slate-300 text-sm ml-6">{event.message}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedAttempt.feedback && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">User Feedback</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-300">{selectedAttempt.feedback}</p>
                  </div>
                </div>
              )}

              {/* Answers with Full Code */}
              {selectedAttempt.answers && selectedAttempt.answers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Detailed Question Analysis</h3>
                  <div className="space-y-4">
                    {selectedAttempt.answers.map((answer, idx) => {
                      const question = selectedAttempt.questions?.[idx];
                      return (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-white font-bold text-lg">Question {idx + 1}</span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  answer.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {answer.passed ? '✓ Passed' : '✗ Failed'}
                                </span>
                              </div>
                              {question && (
                                <div className="text-slate-300 text-sm mb-2">
                                  <span className="font-semibold">{question.title || 'Untitled Question'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Question Description */}
                          {question?.description && (
                            <div className="bg-slate-800/50 rounded p-3 mb-3">
                              <div className="text-slate-400 text-xs uppercase mb-1">Problem Statement</div>
                              <div className="text-slate-300 text-sm whitespace-pre-wrap">{question.description}</div>
                            </div>
                          )}

                          {/* Student's Code */}
                          {answer.code && (
                            <div className="mb-3">
                              <div className="text-slate-400 text-xs uppercase mb-2">Student's Solution</div>
                              <pre className="bg-slate-900 rounded p-4 overflow-x-auto text-sm">
                                <code className="text-green-400">{answer.code}</code>
                              </pre>
                            </div>
                          )}

                          {/* Test Results */}
                          {answer.result && (
                            <div>
                              <div className="text-slate-400 text-xs uppercase mb-2">Execution Results</div>
                              <div className="bg-slate-900 rounded p-3 space-y-2">
                                {answer.result.test_results && answer.result.test_results.length > 0 ? (
                                  answer.result.test_results.map((test, testIdx) => (
                                    <div key={testIdx} className="flex items-start gap-3 text-sm">
                                      <span className={`flex-shrink-0 ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                                        {test.passed ? '✓' : '✗'}
                                      </span>
                                      <div className="flex-1">
                                        <div className="text-slate-300">
                                          Test Case {testIdx + 1}: 
                                          <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                                            {' '}{test.passed ? 'Passed' : 'Failed'}
                                          </span>
                                        </div>
                                        {test.error && (
                                          <div className="text-red-400 text-xs mt-1">{test.error}</div>
                                        )}
                                        {test.actual_output && !test.passed && (
                                          <div className="text-slate-400 text-xs mt-1">
                                            Output: {test.actual_output}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-400 text-sm">No test results available</div>
                                )}
                                
                                {/* Overall Stats */}
                                {answer.result.passed_count !== undefined && (
                                  <div className="mt-3 pt-3 border-t border-slate-700 text-sm">
                                    <span className="text-slate-400">Tests Passed: </span>
                                    <span className="text-white font-semibold">
                                      {answer.result.passed_count}/{answer.result.total_tests || 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsAnalytics

