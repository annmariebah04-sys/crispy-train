import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import type { Reward } from '../../types'

interface Props {
  reward: Reward
  points: number
  onRedeem: () => void
}

export default function RewardCard({ reward, points, onRedeem }: Props) {
  const affordable = points >= reward.cost
  return (
    <motion.div
      whileHover={affordable ? { y: -4 } : undefined}
      className={`glass flex flex-col items-center gap-3 rounded-2xl p-5 text-center ${
        affordable ? '' : 'opacity-50'
      }`}
    >
      <div className="text-4xl">{reward.emoji}</div>
      <div className="text-sm font-medium">{reward.title}</div>
      <div className="text-xs text-amber-300">{reward.cost} pts</div>
      <button
        onClick={onRedeem}
        disabled={!affordable}
        className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          affordable
            ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black hover:opacity-90'
            : 'cursor-not-allowed bg-white/10 text-white/40'
        }`}
      >
        {affordable ? 'Unlock' : <Lock size={11} />}
        {!affordable && 'Locked'}
      </button>
    </motion.div>
  )
}
