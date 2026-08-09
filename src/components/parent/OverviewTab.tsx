import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Check, Clock3, Gift, X } from 'lucide-react'
import { useStore } from '../../lib/store'
import { TEXT } from '../../lib/theme'
import KidAvatar from '../KidAvatar'
import ProofModal from '../ProofModal'
import type { Completion } from '../../types'

export default function OverviewTab() {
  const { data, today, approveCompletion, rejectCompletion, undoCompletion, fulfillRedemption, cancelRedemption } =
    useStore()
  const [viewing, setViewing] = useState<Completion | null>(null)

  const pendingRedemptions = data.redemptions
    .filter((r) => !r.fulfilled)
    .sort((a, b) => a.requestedAt - b.requestedAt)

  const pendingCompletions = [...data.pendingCompletions].sort((a, b) => a.submittedAt - b.submittedAt)

  return (
    <div className="space-y-8">
      {pendingCompletions.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Clock3 size={18} className="text-amber-400" /> Needs your review
          </h2>
          <div className="mt-4 space-y-2">
            {pendingCompletions.map((c) => {
              const kid = data.kids.find((k) => k.id === c.kidId)
              const chore = data.chores.find((ch) => ch.id === c.choreId)
              return (
                <div key={c.id} className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                  <button onClick={() => setViewing(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    {c.photo ? (
                      <img src={c.photo} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/5 text-lg">
                        {c.note ? '📝' : chore?.emoji}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{chore?.title ?? 'Chore'}</div>
                      <div className="truncate text-xs text-white/40">
                        {kid?.emoji} {kid?.name} &middot; +{chore?.points ?? 0} pts &middot;{' '}
                        {new Date(c.submittedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => rejectCompletion(c.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-rose-500/20 hover:text-rose-300"
                      title="Reject — kid can try again"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => approveCompletion(c.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30"
                      title="Approve & award points"
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
                    const approved = completion?.status === 'approved'
                    return (
                      <div key={chore.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                        {completion ? (
                          <button
                            onClick={() => setViewing(completion)}
                            className="h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10"
                          >
                            {completion.photo ? (
                              <img src={completion.photo} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center bg-white/5 text-base">📝</span>
                            )}
                          </button>
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5 text-base">
                            {chore.emoji}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className={approved ? 'truncate text-white/40 line-through' : 'truncate'}>{chore.title}</div>
                          {completion && (
                            <div
                              className={`text-[10px] ${
                                completion.status === 'pending'
                                  ? 'text-amber-300'
                                  : completion.status === 'rejected'
                                    ? 'text-rose-300'
                                    : 'text-white/30'
                              }`}
                            >
                              {completion.status === 'pending'
                                ? 'Waiting for review'
                                : completion.status === 'rejected'
                                  ? 'Rejected'
                                  : new Date(completion.approvedAt ?? completion.submittedAt).toLocaleTimeString([], {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                            </div>
                          )}
                        </div>
                        {approved ? (
                          <button
                            onClick={() => undoCompletion(completion.id)}
                            title="Undo — refunds points"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white"
                          >
                            <X size={11} />
                          </button>
                        ) : (
                          <span className="shrink-0 text-xs text-white/30">
                            {completion?.status === 'pending' ? 'Review above' : completion?.status === 'rejected' ? '' : 'Pending'}
                          </span>
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
          <ProofModal
            completion={viewing}
            chore={data.chores.find((c) => c.id === viewing.choreId)}
            onClose={() => setViewing(null)}
            footer={
              viewing.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      rejectCompletion(viewing.id)
                      setViewing(null)
                    }}
                    className="flex-1 rounded-xl bg-white/10 py-2 text-sm text-white/70 hover:bg-rose-500/20 hover:text-rose-300"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveCompletion(viewing.id)
                      setViewing(null)
                    }}
                    className="flex-1 rounded-xl bg-emerald-400/20 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-400/30"
                  >
                    Approve
                  </button>
                </div>
              ) : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}
