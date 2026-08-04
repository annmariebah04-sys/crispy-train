// Static class name maps so Tailwind's scanner can see every class we might use.
export const KID_COLOR_OPTIONS = ['violet', 'teal', 'rose', 'amber', 'sky', 'lime'] as const
export type KidColor = (typeof KID_COLOR_OPTIONS)[number]

export const GRADIENT: Record<string, string> = {
  violet: 'from-violet-500 to-fuchsia-500',
  teal: 'from-teal-400 to-cyan-500',
  rose: 'from-rose-500 to-orange-400',
  amber: 'from-amber-400 to-orange-500',
  sky: 'from-sky-400 to-blue-500',
  lime: 'from-lime-400 to-emerald-500',
}

export const GLOW: Record<string, string> = {
  violet: 'shadow-[0_0_40px_-8px_rgba(217,70,239,0.6)]',
  teal: 'shadow-[0_0_40px_-8px_rgba(45,212,191,0.6)]',
  rose: 'shadow-[0_0_40px_-8px_rgba(251,113,133,0.6)]',
  amber: 'shadow-[0_0_40px_-8px_rgba(251,191,36,0.6)]',
  sky: 'shadow-[0_0_40px_-8px_rgba(56,189,248,0.6)]',
  lime: 'shadow-[0_0_40px_-8px_rgba(163,230,53,0.6)]',
}

export const TEXT: Record<string, string> = {
  violet: 'text-fuchsia-400',
  teal: 'text-teal-300',
  rose: 'text-rose-400',
  amber: 'text-amber-400',
  sky: 'text-sky-400',
  lime: 'text-lime-400',
}

export const RING: Record<string, string> = {
  violet: 'ring-fuchsia-400/60',
  teal: 'ring-teal-300/60',
  rose: 'ring-rose-400/60',
  amber: 'ring-amber-400/60',
  sky: 'ring-sky-400/60',
  lime: 'ring-lime-400/60',
}

export const EMOJI_CHOICES = ['🦋', '⚡', '🔥', '🌊', '🎮', '🎨', '🐉', '🌟', '🎧', '⚽', '🛹', '🎸']
