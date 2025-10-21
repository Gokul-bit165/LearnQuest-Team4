import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../services/api'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    // Reuse public endpoint for listing via web app base if needed; admin only for mutations
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/courses/')
    const data = await res.json()
    setCourses(data)
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    await adminAPI.deleteCourse(id)
    await load()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file')
      return
    }

    setUploading(true)
    try {
      await adminAPI.uploadCourseJson(file)
      alert('Course uploaded successfully!')
      await load()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload course: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Courses</h1>
        <div className="flex gap-3">
          <label className="px-3 py-2 bg-green-600 rounded inline-block cursor-pointer hover:bg-green-700">
            {uploading ? 'Uploading...' : 'Upload JSON'}
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <Link className="px-3 py-2 bg-blue-600 rounded inline-block hover:bg-blue-700" to="/courses/new">Create New Course</Link>
        </div>
      </div>

      <div className="grid gap-3">
        {courses.map(c => (
          <div key={c.id} className="p-4 border border-slate-800 rounded">
            <div className="font-semibold">{c.title}</div>
            <div className="text-slate-400 text-sm">{c.description}</div>
            <div className="text-slate-400 text-sm">XP: {c.xp_reward}</div>
            <div className="mt-2 flex gap-2">
              <Link className="px-3 py-1 bg-yellow-600 rounded" to={`/courses/${c.id}/edit`}>Edit</Link>
              <button className="px-3 py-1 bg-red-600 rounded" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default Courses


