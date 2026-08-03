import { useState } from 'react'
import { useStore } from '../../lib/store'

export default function SettingsTab() {
  const { data, setParentPin } = useStore()
  const [pin, setPin] = useState('')
  const [saved, setSaved] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) return
    setParentPin(pin)
    setPin('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="glass max-w-sm rounded-2xl p-5">
      <h2 className="font-display text-lg font-bold">Parent PIN</h2>
      <p className="mt-1 text-sm text-white/50">Current PIN: {data.parentPin}</p>
      <form onSubmit={submit} className="mt-4">
        <label className="mb-1.5 block text-xs text-white/50">New PIN (4+ digits)</label>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-xl bg-white/10 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-400/60"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Update PIN
        </button>
        {saved && <p className="mt-2 text-center text-sm text-emerald-400">PIN updated!</p>}
      </form>
    </div>
  )
}
