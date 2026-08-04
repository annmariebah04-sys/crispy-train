import { useState } from 'react'
import { ArrowLeft, LayoutGrid, ListChecks, Gift, Users, Settings } from 'lucide-react'
import CountdownPill from '../CountdownPill'
import OverviewTab from './OverviewTab'
import ChoresTab from './ChoresTab'
import RewardsTab from './RewardsTab'
import KidsTab from './KidsTab'
import SettingsTab from './SettingsTab'

type Tab = 'overview' | 'chores' | 'rewards' | 'kids' | 'settings'

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'chores', label: 'Chores', icon: ListChecks },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'kids', label: 'Kids', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function ParentDashboard({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-8">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft size={14} /> Exit
        </button>
        <CountdownPill />
      </header>

      <h1 className="mt-6 font-display text-3xl font-bold">Parent Dashboard</h1>

      <nav className="glass mt-6 flex w-full gap-1 overflow-x-auto rounded-2xl p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === t.id ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 pb-16">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'chores' && <ChoresTab />}
        {tab === 'rewards' && <RewardsTab />}
        {tab === 'kids' && <KidsTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}
