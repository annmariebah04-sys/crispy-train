import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useStore } from '../lib/store'
import { GRADIENT } from '../lib/theme'
import CountdownPill from './CountdownPill'
import KidAvatar from './KidAvatar'

interface Props {
  onSelectKid: (kidId: string) => void
  onParent: () => void
}

export default function HomeScreen({ onSelectKid, onParent }: Props) {
  const { data } = useStore()

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-12">
      <header className="flex w-full items-center justify-between">
        <div className="font-display text-xl font-bold tracking-tight">
          Chore<span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Quest</span>
        </div>
        <button
          onClick={onParent}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
        >
          <Lock size={14} />
          Parent mode
        </button>
      </header>

      <div className="mt-10">
        <CountdownPill />
      </div>

      <div className="mt-4 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Who's crushing it today?</h1>
        <p className="mt-3 text-white/50">Pick your profile to see today's chores &amp; rewards.</p>
      </div>

      <div className="mt-14 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
        {data.kids.map((kid, i) => (
          <motion.button
            key={kid.id}
            onClick={() => onSelectKid(kid.id)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl p-8"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${GRADIENT[kid.color]} opacity-0 transition-opacity duration-300 group-hover:opacity-15`}
            />
            <KidAvatar kid={kid} className="h-24 w-24 text-5xl" glow />
            <div className="text-center">
              <div className="font-display text-xl font-bold">{kid.name}</div>
              <div className="mt-1 text-sm text-white/50">{kid.points} pts</div>
            </div>
          </motion.button>
        ))}
      </div>

      {data.kids.length === 0 && (
        <div className="glass mt-14 rounded-2xl px-8 py-10 text-center text-white/60">
          No profiles yet. Ask a parent to add kid profiles in Parent mode.
        </div>
      )}
    </div>
  )
}
