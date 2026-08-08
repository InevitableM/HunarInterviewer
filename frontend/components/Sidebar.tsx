'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/api'

const links = [
  { href: '/candidates', label: 'Candidates' },
  { href: '/people-search', label: 'People Search' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    clearToken()
    router.push('/login')
  }

  return (
    <aside className="w-56 bg-white border-r border-slate-100 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6c0 1.6.8 3 2 3.8L4.2 12h5.6l-.3-2.2c1.2-.8 2-2.2 2-3.8 0-2.5-2-4.5-4.5-4.5z"
                fill="white"
                fillOpacity="0.92"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">Hunar</p>
            <p className="text-xs text-slate-400 leading-tight">Interviewer</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
          Log out
        </button>
      </div>
    </aside>
  )
}
