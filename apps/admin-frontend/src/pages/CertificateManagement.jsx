import React, { useState } from 'react'
import { Award, Download, Mail, Settings } from 'lucide-react'

const CertificateManagement = () => {
  const [certificates] = useState([
    { id: 1, userName: 'John Doe', testName: 'React.js', issuedDate: '2025-01-15', status: 'Active' },
    { id: 2, userName: 'Jane Smith', testName: 'Node.js', issuedDate: '2025-01-14', status: 'Active' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Certificate Management</h1>
          <p className="text-slate-400">Handle post-test certification and templates</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
            <Settings className="w-5 h-5" />
            Template Builder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-green-400 mb-2">Certificates Issued</div>
          <div className="text-3xl font-bold text-white">142</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-blue-400 mb-2">Active Templates</div>
          <div className="text-3xl font-bold text-white">5</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-yellow-400 mb-2">This Month</div>
          <div className="text-3xl font-bold text-white">23</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Test</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Issued Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {certificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-slate-700/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{cert.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{cert.testName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{cert.issuedDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                    {cert.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-400 hover:text-blue-300" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="text-green-400 hover:text-green-300" title="Email">
                    <Mail className="w-5 h-5" />
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

export default CertificateManagement

