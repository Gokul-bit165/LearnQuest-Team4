import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'

const CreateCoursePage = () => {
  const navigate = useNavigate()
  const [course, setCourse] = useState({ title: '', description: '', xp_reward: 0, modules: [] })

  const addModule = () => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, { id: crypto.randomUUID(), title: '', topics: [] }]
    }))
  }

  const removeModule = (id) => {
    setCourse(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }))
  }

  const updateModuleTitle = (id, title) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === id ? { ...m, title } : m)
    }))
  }

  const addTopic = (moduleId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, topics: [...m.topics, { id: crypto.randomUUID(), title: '', content: '' }] } : m)
    }))
  }

  const removeTopic = (moduleId, topicId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, topics: m.topics.filter(t => t.id !== topicId) } : m)
    }))
  }

  const updateTopic = (moduleId, topicId, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? {
        ...m,
        topics: m.topics.map(t => t.id === topicId ? { ...t, [field]: value } : t)
      } : m)
    }))
  }

  const saveCourse = async () => {
    const payload = {
      title: course.title,
      description: course.description,
      xp_reward: Number(course.xp_reward) || 0,
      modules: course.modules.map(m => ({
        title: m.title,
        topics: m.topics.map(t => ({ title: t.title, content: t.content }))
      }))
    }
    await adminAPI.createCourse(payload)
    navigate('/courses')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

      {/* Course details */}
      <div className="bg-slate-800 border border-slate-700 rounded p-4 mb-6 space-y-3">
        <input className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Title" value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} />
        <textarea className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Description" value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} />
        <input type="number" className="w-full bg-slate-700 rounded px-3 py-2" placeholder="XP Reward" value={course.xp_reward} onChange={e => setCourse({ ...course, xp_reward: e.target.value })} />
      </div>

      {/* Modules */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Course Modules</h2>
        <button className="px-3 py-2 bg-blue-600 rounded" onClick={addModule}>Add Module</button>
      </div>
      <div className="space-y-4">
        {course.modules.map((m, idx) => (
          <div key={m.id} className="bg-slate-800 border border-slate-700 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Module {idx + 1}</div>
              <button className="px-2 py-1 bg-red-600 rounded" onClick={() => removeModule(m.id)}>Delete Module</button>
            </div>
            <input className="w-full bg-slate-700 rounded px-3 py-2 mb-3" placeholder="Module title" value={m.title} onChange={e => updateModuleTitle(m.id, e.target.value)} />

            {/* Topics */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Topics</div>
              <button className="px-2 py-1 bg-blue-600 rounded" onClick={() => addTopic(m.id)}>Add Topic</button>
            </div>
            <div className="space-y-3">
              {m.topics.map((t, tIdx) => (
                <div key={t.id} className="bg-slate-700 border border-slate-600 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-300">Topic {tIdx + 1}</div>
                    <button className="px-2 py-1 bg-red-600 rounded" onClick={() => removeTopic(m.id, t.id)}>Delete Topic</button>
                  </div>
                  <input className="w-full bg-slate-800 rounded px-3 py-2 mb-2" placeholder="Topic title" value={t.title} onChange={e => updateTopic(m.id, t.id, 'title', e.target.value)} />
                  <textarea className="w-full bg-slate-800 rounded px-3 py-2" placeholder="Topic content (markdown or URL)" value={t.content} onChange={e => updateTopic(m.id, t.id, 'content', e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button className="px-3 py-2 bg-slate-600 rounded" onClick={() => navigate('/courses')}>Cancel</button>
        <button className="px-3 py-2 bg-green-600 rounded" onClick={saveCourse}>Save Course</button>
      </div>
    </div>
  )
}

export default CreateCoursePage


