type CandidateStatus = 'NEW' | 'CONTACTED' | 'INTERVIEWING' | 'COMPLETED'

const candidateStyles: Record<CandidateStatus, string> = {
  NEW: 'bg-slate-100 text-slate-600',
  CONTACTED: 'bg-blue-50 text-blue-700',
  INTERVIEWING: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
}

export function CandidateStatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${candidateStyles[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  )
}

// Hunar's call statuses aren't a fixed closed set on our side (NOT_STARTED, SCHEDULED,
// IN_PROGRESS, COMPLETED, FAILED, NOT_CONNECTED, CANCELLED, ...), so match loosely instead
// of a strict union and fall back to a neutral style for anything unrecognized.
const callStyles: Record<string, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-500',
  SCHEDULED: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  FAILED: 'bg-red-50 text-red-600',
  NOT_CONNECTED: 'bg-red-50 text-red-600',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

export function CallStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${callStyles[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
