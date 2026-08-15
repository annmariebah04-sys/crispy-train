import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatCountdown } from '../lib/dates'

export default function CountdownPill() {
  const [label, setLabel] = useState(() => formatCountdown())

  useEffect(() => {
    const interval = setInterval(() => setLabel(formatCountdown()), 15_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/70">
      <Clock size={13} className="text-amber-400" />
      Chores due by 12:00 AM &middot; <span className="text-amber-300">{label}</span>
    </div>
  )
}
