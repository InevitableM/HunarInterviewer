'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CallStatusBadge } from '@/components/StatusBadge'

interface DashboardRow {
  interview_id: string
  candidate_name: string | null
  candidate_phone: string | null
  candidate_status: string | null
  interview_status: string
  started_at: string | null
  ended_at: string | null
  structured_answers: Record<string, string> | null
  summary: string | null
  recording_url: string | null
}

function InterviewDetail({ row, onClose }: { row: DashboardRow; onClose: () => void }) {
  const answerEntries = Object.entries(row.structured_answers ?? {}).filter(([key]) => key !== 'summary')
  const hasAnswers = answerEntries.length > 0

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg h-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{row.candidate_name ?? 'Unknown candidate'}</h2>
            <p className="text-sm text-slate-500 font-mono">{row.candidate_phone}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Call Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <CallStatusBadge status={row.interview_status} />
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Candidate status</p>
                <p className="text-sm text-slate-700">{row.candidate_status ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Started at</p>
                <p className="text-sm text-slate-700 font-mono">{row.started_at ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Ended at</p>
                <p className="text-sm text-slate-700 font-mono">{row.ended_at ?? '—'}</p>
              </div>
            </div>
          </div>

          {hasAnswers && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Structured Answers</p>
              <div className="bg-white rounded-lg border border-slate-100 divide-y divide-slate-50">
                {answerEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-500 font-mono">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-slate-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {row.summary && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Summary</p>
              <p className="text-sm text-slate-700">{row.summary}</p>
            </div>
          )}

          {row.recording_url && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Recording</p>
              <audio controls src={row.recording_url} className="w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [rows, setRows] = useState<DashboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DashboardRow | null>(null)

  useEffect(() => {
    api
      .get('/dashboard/')
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: rows.length,
    completed: rows.filter((r) => r.interview_status === 'COMPLETED').length,
    scheduled: rows.filter((r) => r.interview_status === 'SCHEDULED').length,
    failed: rows.filter((r) => r.interview_status === 'FAILED' || r.interview_status === 'NOT_CONNECTED').length,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Interview Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track all AI-conducted interviews</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-800' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-600' },
          { label: 'Failed', value: stats.failed, color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-400 mb-1.5">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Started at</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Ended at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((r) => (
              <tr key={r.interview_id} onClick={() => setSelected(r)} className="hover:bg-slate-50/60 cursor-pointer transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {(r.candidate_name ?? '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{r.candidate_name ?? 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{r.candidate_phone ?? '—'}</td>
                <td className="px-5 py-3.5">
                  <CallStatusBadge status={r.interview_status} />
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{r.started_at ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{r.ended_at ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <div className="py-16 text-center text-sm text-slate-400">No interviews yet.</div>}
        {loading && <div className="py-16 text-center text-sm text-slate-400">Loading...</div>}
      </div>

      {selected && <InterviewDetail row={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
