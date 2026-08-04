import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Gift, X } from 'lucide-react'
import { useStore } from '../../lib/store'
import { TEXT } from '../../lib/theme'
import KidAvatar from '../KidAvatar'
import type { Completion } from '../../types'

export default function OverviewTab() {
  const { data, today, uncompleteChore, fulfillRedemption, cancelRedemption } = useStore()
  const [viewing, setViewing] = useState<Completion | null>(null)

  const pendingRedemptions = data.redemptions
    .filter((r) => !r.fulfilled)
    .sort((a, b) => a.requestedAt - b.requestedAt)

  return (
    <div className="space-y-8">
      {pendingRedemptions.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Gift size={18} className="text-fuchsia-400" /> Reward requests
          </h2>
          <div className="mt-4 space-y-2">
            {pendingRedemptions.map((r) => {
              const kid = data.kids.find((k) => k.id === r.kidId)
              const reward = data.rewards.find((rw) => rw.id === r.rewardId)
              return (
                <div key={r.id} className="glass flex items-center justify-between rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{reward?.emoji}</span>
                    <div>
                      <div className="text-sm font-medium">{reward?.title ?? 'Reward'}</div>
                      <div className="text-xs text-white/40">
                        {kid?.emoji} {kid?.name} &middot; {r.cost} pts
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => cancelRedemption(r.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
                      title="Cancel & refund points"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => fulfillRedemption(r.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30"
                      title="Mark as given"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-bold">Today's progress</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {data.kids.map((kid) => {
            const choreIds = data.assignments.filter((a) => a.kidId === kid.id).map((a) => a.choreId)
            const chores = choreIds
              .map((id) => data.chores.find((c) => c.id === id))
              .filter((c): c is NonNullable<typeof c> => Boolean(c))
            const completionByChore = new Map(
              data.completions.filter((c) => c.kidId === kid.id && c.dayKey === today).map((c) => [c.choreId, c]),
            )
            return (
              <div key={kid.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <KidAvatar kid={kid} className="h-11 w-11 text-xl" />
                  <div>
                    <div className="font-semibold">{kid.name}</div>
                    <div className={`text-xs font-medium ${TEXT[kid.color]}`}>{kid.points} pts</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {chores.length === 0 && <div className="text-sm text-white/40">No chores today</div>}
                  {chores.map((chore) => {
                    const completion = completionByChore.get(chore.id)
                    return (
                      <div key={chore.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                        {completion ? (
                          <button
                            onClick={() => setViewing(completion)}
                            className="h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10"
                          >
                            <img src={completion.photo} alt="" className="h-full w-full object-cover" />
                          </button>
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5 text-base">
                            {chore.emoji}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className={completion ? 'truncate text-white/40 line-through' : 'truncate'}>{chore.title}</div>
                          {completion && (
                            <div className="text-[10px] text-white/30">
                              {new Date(completion.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                        {completion ? (
                          <button
                            onClick={() => uncompleteChore(kid.id, chore.id)}
                            title="Undo completion"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white"
                          >
                            <X size={11} />
                          </button>
                        ) : (
                          <span className="shrink-0 text-xs text-white/30">Pending</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm overflow-hidden rounded-3xl"
            >
              <img src={viewing.photo} alt="" className="max-h-[70vh] w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <div className="text-xs text-white/40">
                  Completed {new Date(viewing.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                <button
                  onClick={() => setViewing(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
