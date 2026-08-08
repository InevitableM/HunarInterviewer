'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { CandidateStatusBadge } from '@/components/StatusBadge'

interface Candidate {
  id: string
  name: string
  phone: string
  email: string | null
  linkedin: string | null
  status: 'NEW' | 'CONTACTED' | 'INTERVIEWING' | 'COMPLETED'
}

function AddCandidateModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/candidate/', {
        name: name.trim(),
        phone: phone.trim(),
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
            { label: 'Full name', value: name, set: setName, placeholder: 'Marcus Webb', type: 'text' },
            { label: 'Phone', value: phone, set: setPhone, placeholder: '+1 415 555 0100', type: 'tel' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'marcus@example.com', type: 'email' },
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
      alert(err instanceof Error ? err.message : 'Failed to start interview')
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

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{candidates.length} total candidates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add candidate
        </button>
      </div>

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates..."
          className="w-full max-w-xs px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-400 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{c.phone}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{c.email ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <CandidateStatusBadge status={c.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => handleStartInterview(c.id)}
                      disabled={startingId === c.id}
                      className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-60 font-medium transition-colors"
                    >
                      {startingId === c.id ? 'Starting...' : 'Start interview'}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deletingId === c.id}
                      className="text-sm text-red-500 hover:text-red-600 disabled:opacity-60 font-medium transition-colors"
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
    </div>
  )
}
