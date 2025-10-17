import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', description: '', xp_reward: 0, modules: [] })

  const load = async () => {
    // Reuse public endpoint for listing via web app base if needed; admin only for mutations
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/courses/')
    const data = await res.json()
    setCourses(data)
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    await adminAPI.createCourse(form)
    setCreating(false)
    setForm({ title: '', slug: '', description: '', xp_reward: 0, modules: [] })
    await load()
  }

  const remove = async (id) => {
    await adminAPI.deleteCourse(id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Courses</h1>
        <button className="px-3 py-2 bg-blue-600 rounded" onClick={() => setCreating(true)}>Create New Course</button>
      </div>

      <div className="grid gap-3">
        {courses.map(c => (
          <div key={c.id} className="p-4 border border-slate-800 rounded">
            <div className="font-semibold">{c.title}</div>
            <div className="text-slate-400 text-sm">{c.description}</div>
            <div className="text-slate-400 text-sm">XP: {c.xp_reward}</div>
            <div className="mt-2">
              <button className="px-3 py-1 bg-red-600 rounded" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Course</h2>
            <div className="space-y-3">
              <input className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
              <textarea className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input type="number" className="w-full bg-slate-700 rounded px-3 py-2" placeholder="XP Reward" value={form.xp_reward} onChange={e => setForm({ ...form, xp_reward: Number(e.target.value) })} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 bg-slate-600 rounded" onClick={() => setCreating(false)}>Cancel</button>
              <button className="px-3 py-2 bg-blue-600 rounded" onClick={create}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses


