import React, { useEffect, useState } from 'react'
import { Upload, FileText, Settings, Save, Layers, Clock, Shield, Shuffle, ListChecks, Copy, Download } from 'lucide-react'
import { adminCertTestsAPI } from '../services/api'

const CertificationTestManager = () => {
  const [banks, setBanks] = useState([])
  const [specs, setSpecs] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    cert_id: '',
    difficulty: 'Easy',
    bank_ids: [],
    question_count: 10,
    duration_minutes: 30,
    pass_percentage: 70,
    randomize: true,
    restrict_copy_paste: true,
    prerequisite_course_id: '',
  })

  useEffect(() => {
    loadInitial()
  }, [])

  useEffect(() => {
    // If query params specify cert_id and difficulty, load that spec to prefill the form
    const params = new URLSearchParams(window.location.search)
    const certId = params.get('cert_id')
    const diff = params.get('difficulty')
    if (certId && diff) {
      adminCertTestsAPI.getSpecForCertDifficulty(certId, diff)
        .then((res) => {
          const s = res.data || {}
          setForm({
            cert_id: s.cert_id || certId,
            difficulty: s.difficulty || diff,
            bank_ids: s.bank_ids || [],
            question_count: s.question_count ?? 10,
            duration_minutes: s.duration_minutes ?? 30,
            pass_percentage: s.pass_percentage ?? 70,
            randomize: s.randomize ?? true,
            restrict_copy_paste: s.restrict_copy_paste ?? true,
            prerequisite_course_id: s.prerequisite_course_id || '',
          })
        })
        .catch(() => {
          // no-op if not found
        })
    }
  }, [])

  async function loadInitial() {
    try {
      const [banksRes, specsRes, coursesRes] = await Promise.all([
        adminCertTestsAPI.listBanks(),
        adminCertTestsAPI.listSpecs(),
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/courses/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        })
      ])
      setBanks(banksRes.data || [])
      setSpecs(specsRes.data || [])
      const coursesData = await coursesRes.json().catch(() => [])
      setCourses(Array.isArray(coursesData) ? coursesData : [])
    } catch (e) {
      // no-op
    }
  }

  async function onUpload() {
    if (!selectedFiles.length) return
    try {
      setUploading(true)
      await adminCertTestsAPI.uploadBanks(Array.from(selectedFiles))
      setSelectedFiles([])
      await loadInitial()
      alert('Uploaded question banks successfully')
    } catch (e) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onCreateSpec(e) {
    e.preventDefault()
    try {
      await adminCertTestsAPI.createSpec(form)
      await loadInitial()
      alert('Test spec saved')
    } catch (e) {
      alert('Failed to save spec')
    }
  }

  const toggleBank = (bankId) => {
    setForm((prev) => ({
      ...prev,
      bank_ids: prev.bank_ids.includes(bankId)
        ? prev.bank_ids.filter((id) => id !== bankId)
        : [...prev.bank_ids, bankId],
    }))
  }

  const sampleJson = `[
  {
    "title": "What is Python?",
    "options": ["A programming language", "A snake", "A database", "An OS"],
    "correct_answer": 0,
    "difficulty": "Easy",
    "topic_name": "Python Basics",
    "tags": ["python", "basics"]
  },
  {
    "title": "Which HTTP method is idempotent?",
    "options": ["POST", "PUT", "PATCH", "CONNECT"],
    "correct_answer": 1,
    "difficulty": "Medium",
    "topic_name": "Web",
    "tags": ["http", "web"]
  },
  {
    "type": "code",
    "title": "Sum of two numbers",
    "problem_statement": "Read two integers and print their sum.",
    "test_cases": [
      { "input": "1 2\\n", "expected_output": "3\\n", "is_hidden": false },
      { "input": "10 20\\n", "expected_output": "30\\n", "is_hidden": false }
    ],
    "difficulty": "Easy",
    "topic_name": "Basics",
    "tags": ["code", "sum"]
  }
]`;

  const downloadTemplate = () => {
    const blob = new Blob([sampleJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_bank_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            Certification Test Manager
          </h1>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
            onClick={async () => {
              try {
                // Create a demo bank from the sample JSON
                const file = new File([sampleJson], 'demo_bank.json', { type: 'application/json' })
                const res = await adminCertTestsAPI.uploadBanks([file])
                const uploaded = res.data?.uploaded || []
                if (!uploaded.length) throw new Error('Upload did not return a bank id')
                const bankId = uploaded[0].id

                // Create a demo spec referencing the uploaded bank
                await adminCertTestsAPI.createSpec({
                  cert_id: 'DEMO-PYTHON',
                  difficulty: 'Easy',
                  bank_ids: [bankId],
                  question_count: 5,
                  duration_minutes: 10,
                  pass_percentage: 60,
                  randomize: true,
                  restrict_copy_paste: true,
                  prerequisite_course_id: '',
                })
                await loadInitial()
                alert('Demo test loaded')
              } catch (e) {
                alert('Failed to load demo test: ' + (e.response?.data?.detail || e.message))
              }
            }}
          >
            Load Demo Test
          </button>
        </div>

        {/* Upload Banks */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" /> Upload Question Banks (JSON)
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              accept=".json"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="text-slate-300"
            />
            <button
              onClick={onUpload}
              disabled={uploading || !selectedFiles.length}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> JSON Template
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-slate-300 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Uploaded Banks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {banks.map((b) => (
                <div key={b.id || b.file_name} className="p-3 bg-slate-700 rounded border border-slate-600">
                  <div className="text-white font-medium">
                    {b.display_name || b.file_name}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {b.question_count || 0} questions
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-slate-300 mb-2">JSON Format (example):</div>
              <pre className="bg-slate-900 border border-slate-700 rounded p-4 text-xs text-slate-200 overflow-auto">
{sampleJson}
              </pre>
            </div>
          </div>
        </div>

        {/* Create Test From Bank */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> Create Test from Question Bank
          </h2>

          <form onSubmit={onCreateSpec} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Certification ID</label>
                <input
                  type="text"
                  value={form.cert_id}
                  onChange={(e) => setForm({ ...form, cert_id: e.target.value })}
                  placeholder="e.g., 66ff0b..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Total Questions</label>
                <input
                  type="number"
                  min={1}
                  value={form.question_count}
                  onChange={(e) => setForm({ ...form, question_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Passing Score (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.pass_percentage}
                  onChange={(e) => setForm({ ...form, pass_percentage: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={form.randomize}
                  onChange={(e) => setForm({ ...form, randomize: e.target.checked })}
                />
                <Shuffle className="w-4 h-4" /> Randomize
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={form.restrict_copy_paste}
                  onChange={(e) => setForm({ ...form, restrict_copy_paste: e.target.checked })}
                />
                <Copy className="w-4 h-4" /> Restrict Copy/Paste
              </label>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Prerequisite Course (optional)</label>
                <select
                  value={form.prerequisite_course_id}
                  onChange={(e) => setForm({ ...form, prerequisite_course_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="">None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-slate-300 mb-2 flex items-center gap-2"><ListChecks className="w-4 h-4" /> Select Banks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {banks.map((b) => (
                  <label key={b.id || b.file_name} className={`p-3 rounded border cursor-pointer ${form.bank_ids.includes(b.id || b.file_name) ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 bg-slate-700'}`}>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={form.bank_ids.includes(b.id || b.file_name)}
                      onChange={() => toggleBank(b.id || b.file_name)}
                    />
                    <span className="text-white font-medium">{b.display_name || b.file_name}</span>
                    <span className="ml-2 text-slate-400 text-sm">({b.question_count || 0} questions)</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Test Spec
              </button>
            </div>
          </form>
        </div>

        {/* Existing Specs */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Existing Test Specs</h2>
          <div className="space-y-2">
            {specs.map((s) => (
              <div key={s._id || `${s.cert_id}-${s.difficulty}`} className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="text-white font-medium">{s.cert_id} - {s.difficulty}</div>
                <div className="text-slate-400 text-sm">{s.question_count} questions • {s.duration_minutes} min • Pass {s.pass_percentage}% • Randomize: {s.randomize ? 'Yes' : 'No'} • Restrict: {s.restrict_copy_paste ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default CertificationTestManager
