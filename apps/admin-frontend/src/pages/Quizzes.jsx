import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', course_id: '', duration_seconds: 900, xp_reward: 50, question_ids: [] })

  const load = async () => {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/courses/')
    const courses = await res.json()
    // Pull existing quizzes via admin or public? We'll fetch by course->quiz mapping from API in future; for now, list none by default
    const qRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/courses/')
    setQuizzes([])
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    await adminAPI.createQuiz(form)
    setCreating(false)
    setForm({ title: '', course_id: '', duration_seconds: 900, xp_reward: 50, question_ids: [] })
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <button className="px-3 py-2 bg-blue-600 rounded" onClick={() => setCreating(true)}>Create Quiz</button>
      </div>

      {quizzes.length === 0 && (
        <div className="text-slate-400">No quizzes listed. Use Create to add one.</div>
      )}

      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Quiz</h2>
            <div className="space-y-3">
              <input className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Course ID" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} />
              <input type="number" className="w-full bg-slate-700 rounded px-3 py-2" placeholder="Duration (seconds)" value={form.duration_seconds} onChange={e => setForm({ ...form, duration_seconds: Number(e.target.value) })} />
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

export default Quizzes


