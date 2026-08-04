import { Check, Gift, X } from 'lucide-react'
import { useStore } from '../../lib/store'
import { TEXT } from '../../lib/theme'
import { getWeekdayForDayKey } from '../../lib/dates'
import KidAvatar from '../KidAvatar'

export default function OverviewTab() {
  const { data, today, toggleComplete, fulfillRedemption, cancelRedemption } = useStore()
  const weekday = getWeekdayForDayKey(today)

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
            const chores = data.chores.filter(
              (c) => c.kidId === kid.id && c.active && (c.days.length === 0 || c.days.includes(weekday)),
            )
            const doneIds = new Set(
              data.completions.filter((c) => c.kidId === kid.id && c.dayKey === today).map((c) => c.choreId),
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
                    const done = doneIds.has(chore.id)
                    return (
                      <button
                        key={chore.id}
                        onClick={() => toggleComplete(kid.id, chore.id)}
                        className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10"
                      >
                        <span className={done ? 'text-white/40 line-through' : ''}>
                          {chore.emoji} {chore.title}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            done ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/25 text-transparent'
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
