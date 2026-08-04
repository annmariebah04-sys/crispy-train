export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday

export interface Kid {
  id: string
  name: string
  emoji: string
  color: string // tailwind gradient key, see theme.ts
  photo?: string // optional uploaded avatar image, as a data URL
  background?: string // optional uploaded background image, as a data URL
  points: number
  totalEarned: number
  createdAt: number
}

export interface Chore {
  id: string
  kidId: string
  title: string
  emoji: string
  points: number
  days: Weekday[] // which weekdays this chore is active; empty = every day
  active: boolean
  createdAt: number
}

export interface Completion {
  id: string
  kidId: string
  choreId: string
  dayKey: string // which chore-cycle day this completion belongs to
  completedAt: number
}

export interface Reward {
  id: string
  title: string
  emoji: string
  cost: number
  active: boolean
  createdAt: number
}

export interface Redemption {
  id: string
  kidId: string
  rewardId: string
  cost: number
  requestedAt: number
  fulfilled: boolean
  fulfilledAt?: number
}

export interface AppData {
  kids: Kid[]
  chores: Chore[]
  completions: Completion[]
  rewards: Reward[]
  redemptions: Redemption[]
  parentPin: string
}
