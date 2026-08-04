import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { GRADIENT, KID_COLOR_OPTIONS, EMOJI_CHOICES, type KidColor } from '../../lib/theme'
import KidAvatar from '../KidAvatar'

export default function KidsTab() {
  const { data, addKid, updateKid, removeKid } = useStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0])
  const [color, setColor] = useState<KidColor>(KID_COLOR_OPTIONS[0])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addKid(name.trim(), emoji, color)
    setName('')
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Add a kid profile</h2>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kid's name"
            className="w-full rounded-xl bg-white/10 px-3 py-2.5 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-fuchsia-400/60"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/50">Avatar</label>
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
          <label className="mb-1.5 block text-xs text-white/50">Color</label>
          <div className="flex flex-wrap gap-2">
            {KID_COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${GRADIENT[c]} transition ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a12]' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          <Plus size={15} /> Add kid
        </button>
      </form>

      <section>
        <h2 className="font-display text-lg font-bold">All kids</h2>
        <div className="mt-4 space-y-2">
          {data.kids.map((kid) => (
            <div key={kid.id} className="glass flex items-center justify-between rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <KidAvatar kid={kid} className="h-10 w-10 text-lg" />
                <div>
                  <input
                    value={kid.name}
                    onChange={(e) => updateKid(kid.id, { name: e.target.value })}
                    className="rounded-lg bg-transparent px-1 py-0.5 text-sm font-medium outline-none focus:bg-white/10"
                  />
                  <div className="px-1 text-xs text-white/40">{kid.points} pts &middot; {kid.totalEarned} lifetime</div>
                </div>
              </div>
              <button
                onClick={() => removeKid(kid.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-300"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
