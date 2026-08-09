import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useStore } from '../../lib/store'
import ProofModal from '../ProofModal'
import type { Completion } from '../../types'

export default function HistoryTab() {
  const { data, loadHistory } = useStore()
  const [items, setItems] = useState<Completion[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [viewing, setViewing] = useState<Completion | null>(null)
  const [kidFilter, setKidFilter] = useState('all')

  async function refresh() {
    setBusy(true)
    try {
      setItems(await loadHistory())
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = (items ?? []).filter((c) => kidFilter === 'all' || c.kidId === kidFilter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">History</h2>
        <div className="flex items-center gap-2">
          <select
            value={kidFilter}
            onChange={(e) => setKidFilter(e.target.value)}
            className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="all">All kids</option>
            {data.kids.map((k) => (
              <option key={k.id} value={k.id}>
                {k.emoji} {k.name}
              </option>
            ))}
          </select>
          <button
            onClick={refresh}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={13} className={busy ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {items === null ? (
        <div className="glass rounded-2xl p-6 text-center text-white/40">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center text-white/40">No history yet.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const kid = data.kids.find((k) => k.id === c.kidId)
            const chore = data.chores.find((ch) => ch.id === c.choreId)
            return (
              <button
                key={c.id}
                onClick={() => setViewing(c)}
                className="glass flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left"
              >
                {c.photo ? (
                  <img src={c.photo} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/5 text-lg">
                    {c.note ? '📝' : (chore?.emoji ?? '✅')}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{chore?.title ?? 'Chore'}</div>
                  <div className="truncate text-xs text-white/40">
                    {kid?.emoji} {kid?.name} &middot;{' '}
                    {new Date(c.submittedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div
                  className={`shrink-0 text-xs font-semibold ${
                    c.status === 'approved' ? 'text-emerald-300' : c.status === 'rejected' ? 'text-rose-300' : 'text-amber-300'
                  }`}
                >
                  {c.status === 'approved' ? `+${chore?.points ?? 0} pts` : c.status === 'rejected' ? 'Rejected' : 'Pending'}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {viewing && (
          <ProofModal
            completion={viewing}
            chore={data.chores.find((c) => c.id === viewing.choreId)}
            onClose={() => setViewing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
