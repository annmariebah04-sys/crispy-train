import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { WEEKDAY_LABELS } from '../../lib/dates'
import type { Weekday } from '../../types'

const EMOJI_CHOICES = ['🧽', '🧹', '🍽️', '🛏️', '🧺', '🗑️', '🐶', '🌱', '🚗', '📚', '🧸', '🪟']

export default function ChoresTab() {
  const { data, addChore, updateChore, removeChore } = useStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0])
  const [points, setPoints] = useState(10)
  const [days, setDays] = useState<Weekday[]>([])
  const [assignedKidId, setAssignedKidId] = useState('')

  function toggleDay(d: Weekday) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addChore(title.trim(), emoji, points, days, assignedKidId || undefined)
    setTitle('')
    setPoints(10)
    setDays([])
    setAssignedKidId('')
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Add a chore</h2>
        <p className="mt-1 text-xs text-white/40">
          Chores go into a shared pool — every day, the app randomly hands them out across the kids so nobody
          gets the same one two days in a row.
        </p>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">Chore title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wash the dishes"
            className="w-full rounded-xl bg-white/10 px-3 py-2.5 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-fuchsia-400/60"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">Points</label>
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-40 rounded-xl bg-white/10 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-400/60"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                  emoji === e ? 'bg-fuchsia-500/30 ring-2 ring-fuchsia-400' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">
            Days (leave blank for every day)
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                type="button"
                key={label}
                onClick={() => toggleDay(i as Weekday)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  days.includes(i as Weekday) ? 'bg-cyan-400/30 text-cyan-200 ring-2 ring-cyan-300' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">Assigned to</label>
          <select
            value={assignedKidId}
            onChange={(e) => setAssignedKidId(e.target.value)}
            className="w-full rounded-xl bg-white/10 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-400/60"
          >
            <option value="">🎲 Random (recommended)</option>
            {data.kids.map((k) => (
              <option key={k.id} value={k.id}>
                {k.emoji} Always {k.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-white/30">
            Random spreads chores fairly and avoids repeats. Picking a kid means they always get this chore on its days.
          </p>
        </div>

        <button
          type="submit"
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          <Plus size={15} /> Add chore
        </button>
      </form>

      <section>
        <h2 className="font-display text-lg font-bold">Chore pool</h2>
        <div className="mt-4 space-y-2">
          {data.chores.map((chore) => {
            const pinnedKid = chore.assignedKidId ? data.kids.find((k) => k.id === chore.assignedKidId) : undefined
            const todayAssignment = data.assignments.find((a) => a.choreId === chore.id)
            const todayKid = todayAssignment ? data.kids.find((k) => k.id === todayAssignment.kidId) : undefined
            return (
              <div key={chore.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{chore.emoji}</span>
                  <div>
                    <div className="text-sm font-medium">{chore.title}</div>
                    <div className="text-xs text-white/40">
                      {chore.points} pts &middot;{' '}
                      {chore.days.length === 0 ? 'Every day' : chore.days.map((d) => WEEKDAY_LABELS[d]).join(', ')}
                      {pinnedKid ? (
                        <>
                          {' '}
                          &middot; always: {pinnedKid.emoji} {pinnedKid.name}
                        </>
                      ) : (
                        todayKid && (
                          <>
                            {' '}
                            &middot; today: {todayKid.emoji} {todayKid.name}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={chore.assignedKidId ?? ''}
                    onChange={(e) => updateChore(chore.id, { assignedKidId: e.target.value || undefined })}
                    className="rounded-lg bg-white/5 px-2 py-1.5 text-xs text-white/60 outline-none"
                  >
                    <option value="">🎲 Random</option>
                    {data.kids.map((k) => (
                      <option key={k.id} value={k.id}>
                        Always {k.name}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-white/50">
                    <input
                      type="checkbox"
                      checked={chore.active}
                      onChange={(e) => updateChore(chore.id, { active: e.target.checked })}
                      className="accent-fuchsia-500"
                    />
                    Active
                  </label>
                  <button
                    onClick={() => removeChore(chore.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
          {data.chores.length === 0 && <div className="glass rounded-2xl p-6 text-center text-white/40">No chores yet.</div>}
        </div>
      </section>
    </div>
  )
}
