import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock } from 'lucide-react'
import { useStore } from '../../lib/store'

interface Props {
  onSuccess: () => void
  onBack: () => void
}

export default function ParentGate({ onSuccess, onBack }: Props) {
  const { data } = useStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pin === data.parentPin) {
      onSuccess()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
      <button
        onClick={onBack}
        className="glass absolute left-6 top-8 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="glass flex h-16 w-16 items-center justify-center rounded-full">
        <Lock size={24} className="text-fuchsia-400" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold">Parent Mode</h1>
      <p className="mt-2 text-center text-sm text-white/50">Enter the parent PIN to manage chores &amp; rewards.</p>

      <motion.form
        onSubmit={submit}
        animate={error ? { x: [0, -8, 8, -8, 0] } : {}}
        className="mt-8 w-full"
      >
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="glass w-full rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] outline-none placeholder:tracking-normal placeholder:text-white/30 focus:ring-2 focus:ring-fuchsia-400/60"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-3 font-semibold text-black transition hover:opacity-90"
        >
          Unlock
        </button>
        {error && <p className="mt-3 text-center text-sm text-rose-400">Incorrect PIN, try again.</p>}
      </motion.form>

      <p className="mt-6 text-xs text-white/30">Default PIN is 1234 &mdash; change it from the parent dashboard.</p>
    </div>
  )
}
