export default function VisionPage() {
  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Attendance Without Smartphones</h1>
        <p className="text-sm text-slate-500 mt-0.5">A design question</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">The question</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          If there were no smartphones but LLMs exist / everything else exists except apps, and you are an HR who
          has to track attendance of 1,000 people every day across 100 locations — what would you do?
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Core idea</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            No one has to remember to check in. An automated program places the call — a Voice AI agent dials
            every worker at their scheduled shift time and confirms attendance in a 15–20 second conversation.
            The worker just answers whatever phone they have — a landline, a shared site phone, or a basic
            mobile. No app, no smartphone, no action required from HR once it's set up.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">How it works day-to-day</p>
          <ol className="space-y-3">
            {[
              {
                title: 'Scheduled outbound calls',
                body: 'A program (the same bulk-calling logic already in this app) triggers 1,000 outbound calls automatically at each worker’s shift start time — no worker dials in, no worker has to remember anything.',
              },
              {
                title: 'Voice AI verification',
                body: 'The AI agent greets the worker by name, asks them to confirm their identity (spoken ID, or a keypad fallback), and matches it against the roster.',
              },
              {
                title: 'Location confirmation',
                body: 'The program already knows which of the 100 locations each worker is assigned to — the call is placed knowing that in advance, no lookup needed. The agent can also ask the worker to confirm they are on-site as a light check.',
              },
              {
                title: 'Timestamp logged automatically',
                body: 'The call itself is the timestamp — the program logs it the moment the call completes. The same automated call repeats at shift-end for check-out.',
              },
              {
                title: 'No-answer handling',
                body: 'If a call goes unanswered, the program automatically retries after a few minutes, then flags the worker as "not confirmed" for a supervisor to follow up — no manual dialing, no queues to manage.',
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{step.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Preventing proxy attendance</p>
          <div className="space-y-2.5">
            {[
              {
                label: 'Outbound-only, to a fixed number',
                detail:
                  'The call always goes to that worker\'s own registered number, at their scheduled time — no one can call in and claim an ID. Proxying requires physically holding that specific phone at that specific moment.',
              },
              {
                label: 'Voice-print matching',
                detail:
                  'Each worker\'s voice is fingerprinted on their first few calls. Later calls are compared against it, and a mismatch flags the check-in for a supervisor to review instead of auto-approving it.',
              },
              {
                label: 'Randomized live challenge',
                detail:
                  'The agent asks something that must be answered in the moment — e.g. a rotating 4-digit code shown only to the supervisor on-site that day, or "repeat this number back to me." A pre-recorded or coached answer can\'t predict it.',
              },
              {
                label: 'Location cross-check',
                detail:
                  'Where the site has any fixed presence signal (a landline, a site-linked SIM, or a supervisor confirming headcount at the end of the day), attendance can be cross-verified against it and discrepancies flagged automatically.',
              },
            ].map((row) => (
              <div key={row.label} className="text-sm">
                <span className="font-medium text-slate-800">{row.label}: </span>
                <span className="text-slate-500">{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
