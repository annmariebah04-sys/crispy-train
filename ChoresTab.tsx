import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Chore } from '../../types'

interface Props {
  chore: Chore
  done: boolean
  onToggle: () => void
}

export default function ChoreCard({ chore, done, onToggle }: Props) {
  return (
    <motion.button
      layout
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className={`glass flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
        done ? 'opacity-60' : 'hover:bg-white/10'
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
        {chore.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${done ? 'line-through text-white/50' : ''}`}>{chore.title}</div>
        <div className="text-xs text-white/40">+{chore.points} pts</div>
      </div>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
          done ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/25 text-transparent'
        }`}
      >
        <Check size={16} strokeWidth={3} />
      </div>
    </motion.button>
  )
}
