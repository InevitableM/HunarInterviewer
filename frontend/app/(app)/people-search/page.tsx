'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface PersonResult {
  person_id: string
  name: string | null
  title: string | null
  company: string | null
  linkedin_url: string | null
}

interface SearchHistoryItem {
  id: string
  job_title: string | null
  results: PersonResult[]
  created_at: string
}

function PersonCard({
  person,
  isAdding,
  isAdded,
  showConfirmation,
  onAdd,
}: {
  person: PersonResult
  isAdding: boolean
  isAdded: boolean
  showConfirmation: boolean
  onAdd: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
            {(person.name ?? '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">{person.name}</p>
            <p className="text-sm text-slate-500">{person.title}</p>
            <p className="text-sm text-slate-400">{person.company}</p>
            {person.linkedin_url && (
              <a
                href={person.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-600 hover:text-teal-700 mt-1 inline-block transition-colors break-all"
              >
                {person.linkedin_url}
              </a>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 relative">
          {showConfirmation && (
            <div className="absolute -top-9 right-0 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-sm">
              Added as candidate
            </div>
          )}
          <button
            onClick={onAdd}
            disabled={isAdding || isAdded}
            className={`w-full sm:w-auto text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isAdded ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white'
            }`}
          >
            {isAdding ? 'Adding...' : isAdded ? 'Added ✓' : 'Add candidate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PeopleSearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [addingId, setAddingId] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  function loadHistory() {
    setHistoryLoading(true)
    api
      .get('/people/history')
      .then(setHistory)
      .finally(() => setHistoryLoading(false))
  }

  useEffect(() => {
    loadHistory()
  }, [])

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.post('/people/search', { job_title: query.trim(), limit: 10 })
      const historyList: SearchHistoryItem[] = await api.get('/people/history')
      setHistory(historyList)
      setExpandedId(historyList[0]?.id ?? null)
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id))
  }

  async function handleAddCandidate(person: PersonResult) {
    setAddingId(person.person_id)
    try {
      const info = await api.post('/people/enrich', { person_id: person.person_id })
      await api.post('/candidate/import', {
        name: info.name ?? person.name ?? 'Unknown',
        phone: info.phone ?? '',
        email: info.email ?? undefined,
        linkedin: person.linkedin_url ?? undefined,
      })
      setAdded((prev) => new Set(prev).add(person.person_id))
      setJustAddedId(person.person_id)
      setTimeout(() => setJustAddedId((current) => (current === person.person_id ? null : current)), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add candidate')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">People Search</h1>
        <p className="text-sm text-slate-500 mt-0.5">Find and import candidates from professional networks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Job title</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Senior Full Stack Engineer"
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Recent searches</p>

      {historyLoading && <p className="text-sm text-slate-400">Loading history...</p>}

      {!historyLoading && history.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">Enter a job title to search for candidates</p>
        </div>
      )}

      {!historyLoading && history.length > 0 && (
        <div className="space-y-2">
          {history.map((item) => {
            const isExpanded = expandedId === item.id

            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50/60 transition-colors"
                >
                  <svg
                    className={`text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.job_title ?? 'Untitled search'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-sm text-slate-500 flex-shrink-0">{item.results.length} results</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/40">
                    {item.results.map((person) => (
                      <PersonCard
                        key={person.person_id}
                        person={person}
                        isAdding={addingId === person.person_id}
                        isAdded={added.has(person.person_id)}
                        showConfirmation={justAddedId === person.person_id}
                        onAdd={() => handleAddCandidate(person)}
                      />
                    ))}
                    {item.results.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No results for this search.</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
