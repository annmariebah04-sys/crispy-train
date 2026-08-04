import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../lib/store'

const EMOJI_CHOICES = ['🎁', '📱', '🎬', '🌙', '💵', '🍕', '🎮', '🛍️', '🍦', '🚲', '🎟️', '⏰']

export default function RewardsTab() {
  const { data, addReward, updateReward, removeReward } = useStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0])
  const [cost, setCost] = useState(20)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addReward(title.trim(), emoji, cost)
    setTitle('')
    setCost(20)
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Add a reward</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Reward title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30 min extra screen time"
              className="w-full rounded-xl bg-white/10 px-3 py-2.5 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-fuchsia-400/60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Cost (points)</label>
            <input
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full rounded-xl bg-white/10 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-400/60"
            />
          </div>
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
        <button
          type="submit"
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          <Plus size={15} /> Add reward
        </button>
      </form>

      <section>
        <h2 className="font-display text-lg font-bold">All rewards</h2>
        <div className="mt-4 space-y-2">
          {data.rewards.map((reward) => (
            <div key={reward.id} className="glass flex items-center justify-between rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{reward.emoji}</span>
                <div>
                  <div className="text-sm font-medium">{reward.title}</div>
                  <div className="text-xs text-white/40">{reward.cost} pts</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-white/50">
                  <input
                    type="checkbox"
                    checked={reward.active}
                    onChange={(e) => updateReward(reward.id, { active: e.target.checked })}
                    className="accent-fuchsia-500"
                  />
                  Active
                </label>
                <button
                  onClick={() => removeReward(reward.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {data.rewards.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-white/40">No rewards yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
