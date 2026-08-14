'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { CandidateStatusBadge, CallStatusBadge } from '@/components/StatusBadge'
import ErrorModal from '@/components/ErrorModal'

interface Candidate {
  id: string
  name: string
  phone: string
  email: string | null
  linkedin: string | null
  role: string | null
  status: 'NEW' | 'CONTACTED' | 'INTERVIEWING' | 'COMPLETED'
}

interface Interview {
  id: string
  hunar_call_id: string | null
  status: string
  started_at: string | null
  ended_at: string | null
}

function CandidateDetail({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/interview/?candidate_id=${candidate.id}`)
      .then(setInterviews)
      .finally(() => setLoading(false))
  }, [candidate.id])

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg h-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{candidate.name}</h2>
            <p className="text-sm text-slate-500 font-mono">{candidate.phone}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Candidate Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <CandidateStatusBadge status={candidate.status} />
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Role</p>
                <p className="text-sm text-slate-700">{candidate.role ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="text-sm text-slate-700">{candidate.email ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">LinkedIn</p>
                {candidate.linkedin ? (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 transition-colors break-all"
                  >
                    View profile
                  </a>
                ) : (
                  <p className="text-sm text-slate-700">—</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Interview History</p>
            {loading && <p className="text-sm text-slate-400">Loading...</p>}
            {!loading && interviews.length === 0 && (
              <p className="text-sm text-slate-400">No interviews started yet.</p>
            )}
            {!loading && interviews.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-100 divide-y divide-slate-50">
                {interviews.map((iv) => (
                  <div key={iv.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <CallStatusBadge status={iv.status} />
                      <p className="text-xs text-slate-400 mt-1 font-mono">{iv.started_at ?? 'not started yet'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddCandidateModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !role.trim()) {
      setError('Name, phone and role are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/candidate/', {
        name: name.trim(),
        phone: phone.trim(),
        role: role.trim(),
        email: email.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      })
      onAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add candidate')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Add candidate</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Full name', value: name, set: setName, placeholder: 'Candidate Name', type: 'text' },
            { label: 'Phone', value: phone, set: setPhone, placeholder: '+91XXXXXXXXXX', type: 'tel' },
            { label: 'Role', value: role, set: setRole, placeholder: 'e.g. Software Engineer', type: 'text' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'candidate@example.com', type: 'email' },
            { label: 'LinkedIn URL', value: linkedin, set: setLinkedin, placeholder: 'linkedin.com/in/...', type: 'url' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
              />
            </div>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Adding...' : 'Add candidate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStarting, setBulkStarting] = useState(false)
  const [viewing, setViewing] = useState<Candidate | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  async function loadCandidates() {
    setLoading(true)
    try {
      const data = await api.get('/candidate/')
      setCandidates(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCandidates()
  }, [])

  async function handleStartInterview(candidateId: string) {
    setStartingId(candidateId)
    try {
      await api.post('/interview/start', { candidate_id: candidateId })
      await loadCandidates()
      router.push('/dashboard')
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : 'Failed to start interview')
    } finally {
      setStartingId(null)
    }
  }

  async function handleDelete(candidateId: string, name: string) {
    if (!confirm(`Delete ${name}? This will also remove their interview history.`)) return
    setDeletingId(candidateId)
    try {
      await api.delete(`/candidate/${candidateId}`)
      await loadCandidates()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete candidate')
    } finally {
      setDeletingId(null)
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.id))))
  }

  async function handleBulkStartInterview() {
    setBulkStarting(true)
    try {
      await api.post('/interview/bulk-start', { candidate_ids: Array.from(selected) })
      setSelected(new Set())
      await loadCandidates()
      router.push('/dashboard')
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : 'Failed to start interviews')
    } finally {
      setBulkStarting(false)
    }
  }

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{candidates.length} total candidates</p>

        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add candidate
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates..."
          className="w-full sm:max-w-xs px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-400 bg-white"
        />
        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
            <span className="text-sm text-teal-800 font-medium">{selected.size} selected</span>
            <button
              onClick={handleBulkStartInterview}
              disabled={bulkStarting}
              className="text-sm font-medium bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {bulkStarting ? 'Starting...' : `Start interview${selected.size > 1 ? 's' : ''}`}
            </button>
            <button onClick={() => setSelected(new Set())} className="text-sm text-teal-700 hover:text-teal-800 transition-colors">
              Clear
            </button>
          </div>
        )}
      </div>
      
          <p className="text-xs text-slate-400 mt-1">Go to the Dashboard tab to check interview call status</p>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-160">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30"
                />
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setViewing(c)}
                className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${selected.has(c.id) ? 'bg-teal-50/40' : ''}`}
              >
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelected(c.id)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{c.role ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{c.phone}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{c.email ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <CandidateStatusBadge status={c.status} />
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => handleStartInterview(c.id)}
                      disabled={startingId === c.id}
                      className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-60 font-medium transition-colors whitespace-nowrap"
                    >
                      {startingId === c.id ? 'Starting...' : 'Start interview'}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deletingId === c.id}
                      className="text-sm text-red-500 hover:text-red-600 disabled:opacity-60 font-medium transition-colors whitespace-nowrap"
                    >
                      {deletingId === c.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-400">No candidates match your search.</div>
        )}
        {loading && <div className="py-16 text-center text-sm text-slate-400">Loading...</div>}
      </div>

      {showModal && <AddCandidateModal onClose={() => setShowModal(false)} onAdded={loadCandidates} />}
      {viewing && <CandidateDetail candidate={viewing} onClose={() => setViewing(null)} />}
      {errorModal && <ErrorModal message={errorModal} onClose={() => setErrorModal(null)} />}
    </div>
  )
}
