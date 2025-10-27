import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'

const Certifications = () => {
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCert, setEditingCert] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    duration_minutes: 30,
    pass_percentage: 70
  })

  useEffect(() => {
    fetchCertifications()
  }, [])

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const fetchCertifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/certifications/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch certifications')
      }
      
      const data = await response.json()
      setCertifications(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      console.log('Creating certification:', formData)
      console.log('API URL:', `${API_BASE_URL}/api/admin/certifications/`)
      
      const response = await fetch(`${API_BASE_URL}/api/admin/certifications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.detail || `Failed to create certification: ${response.status}`)
      }

      const result = await response.json()
      console.log('Success:', result)
      
      await fetchCertifications()
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        difficulty: 'Easy',
        duration_minutes: 30,
        pass_percentage: 70
      })
      setError(null)
    } catch (err) {
      console.error('Create error:', err)
      setError(err.message)
    }
  }

  const handleEdit = (cert) => {
    setEditingCert(cert)
    setFormData({
      title: cert.title,
      description: cert.description,
      difficulty: cert.difficulty,
      duration_minutes: cert.duration_minutes,
      pass_percentage: cert.pass_percentage
    })
    setShowCreateModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/certifications/${editingCert._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update certification')
      }

      await fetchCertifications()
      setShowCreateModal(false)
      setEditingCert(null)
      setFormData({
        title: '',
        description: '',
        difficulty: 'Easy',
        duration_minutes: 30,
        pass_percentage: 70
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/certifications/${certId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete certification')
      }

      await fetchCertifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Tough': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading certifications...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Certifications</h1>
          <button
            onClick={() => {
              setEditingCert(null)
              setFormData({
                title: '',
                description: '',
                difficulty: 'Easy',
                duration_minutes: 30,
                pass_percentage: 70
              })
              setShowCreateModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create New Certification
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-900 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certifications.map((cert) => (
                <tr key={cert._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cert.title}</div>
                      <div className="text-sm text-gray-500">{cert.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(cert.difficulty)}`}>
                      {cert.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cert.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cert.pass_percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cert.question_ids.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/certifications/${cert._id}/questions`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage Questions
                    </Link>
                    <button
                      onClick={() => handleEdit(cert)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {certifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No certifications found</div>
            <div className="text-gray-400 text-sm">Create your first certification to get started</div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingCert(null)
        }}
        title={editingCert ? 'Edit Certification' : 'Create New Certification'}
      >
        <form onSubmit={editingCert ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Tough">Tough</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pass Percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.pass_percentage}
              onChange={(e) => setFormData({ ...formData, pass_percentage: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                setEditingCert(null)
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {editingCert ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Certifications
