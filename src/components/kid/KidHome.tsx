import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Gift, Clock3, Pencil } from 'lucide-react'
import { useStore } from '../../lib/store'
import { GRADIENT, TEXT } from '../../lib/theme'
import ChoreCard from './ChoreCard'
import RewardCard from './RewardCard'
import CountdownPill from '../CountdownPill'
import AvatarPicker from './AvatarPicker'
import KidAvatar from '../KidAvatar'
import type { Chore } from '../../types'

interface Props {
  kidId: string
  onBack: () => void
}

export default function KidHome({ kidId, onBack }: Props) {
  const { data, today, completeChore, redeemReward, updateKid } = useStore()
  const [toast, setToast] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const kid = data.kids.find((k) => k.id === kidId)

  const chores = useMemo(() => {
    const choreIds = data.assignments.filter((a) => a.kidId === kidId).map((a) => a.choreId)
    return choreIds
      .map((id) => data.chores.find((c) => c.id === id))
      .filter((c): c is Chore => Boolean(c))
  }, [data.assignments, data.chores, kidId])

  const completions = useMemo(
    () =>
      new Map(
        data.completions.filter((c) => c.kidId === kidId && c.dayKey === today).map((c) => [c.choreId, c]),
      ),
    [data.completions, kidId, today],
  )

  const doneCount = chores.filter((c) => completions.has(c.id)).length
  const progress = chores.length ? Math.round((doneCount / chores.length) * 100) : 0

  const myRedemptions = data.redemptions
    .filter((r) => r.kidId === kidId && !r.fulfilled)
    .sort((a, b) => b.requestedAt - a.requestedAt)

  if (!kid) return null

  async function handleRedeem(rewardId: string, title: string) {
    const ok = await redeemReward(kidId, rewardId)
    setToast(ok ? `${title} unlocked! Ask a parent to claim it.` : 'Not enough points yet.')
    setTimeout(() => setToast(null), 2600)
  }

  return (
    <div className="relative min-h-screen">
      {kid.background && (
        <div className="fixed inset-0 -z-10">
          <img src={kid.background} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/65" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft size={14} /> Profiles
          </button>
          <CountdownPill />
        </header>

        <div className="mt-8 flex items-center gap-5">
          <button onClick={() => setPickerOpen(true)} className="group relative" aria-label="Change your avatar">
            <KidAvatar kid={kid} className="h-20 w-20 text-4xl" glow />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white ring-2 ring-[#0a0a12] transition group-hover:bg-white/25">
              <Pencil size={12} />
            </div>
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold">{kid.name}</h1>
            <div className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${TEXT[kid.color]}`}>
              <Sparkles size={14} /> {kid.points} points available
            </div>
          </div>
        </div>

        <AvatarPicker
          open={pickerOpen}
          kid={kid}
          onUpdate={(patch) => updateKid(kidId, patch)}
          onClose={() => setPickerOpen(false)}
        />

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Today's chores</h2>
            <span className="text-sm text-white/40">
              {doneCount}/{chores.length} done
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${GRADIENT[kid.color]}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="mt-5 space-y-3">
            <AnimatePresence>
              {chores.map((chore) => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  completion={completions.get(chore.id)}
                  onComplete={(photo) => completeChore(kidId, chore.id, photo)}
                />
              ))}
            </AnimatePresence>
            {chores.length === 0 && (
              <div className="glass rounded-2xl p-6 text-center text-white/50">
                No chores assigned for today. Enjoy the break! 🎉
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Gift size={18} className="text-fuchsia-400" /> Rewards shelf
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.rewards
              .filter((r) => r.active)
              .map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  points={kid.points}
                  onRedeem={() => handleRedeem(reward.id, reward.title)}
                />
              ))}
          </div>
        </section>

        {myRedemptions.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Clock3 size={18} className="text-amber-400" /> Waiting on parent
            </h2>
            <div className="mt-4 space-y-2">
              {myRedemptions.map((r) => {
                const reward = data.rewards.find((rw) => rw.id === r.rewardId)
                return (
                  <div key={r.id} className="glass flex items-center justify-between rounded-xl px-4 py-3 text-sm">
                    <span>
                      {reward?.emoji} {reward?.title ?? 'Reward'}
                    </span>
                    <span className="text-white/40">Pending</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
