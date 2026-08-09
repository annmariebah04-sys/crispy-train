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

// A chore is a household-wide pool item — it isn't tied to one kid. Which
// kid does it on a given day comes from that day's Assignment instead,
// unless assignedKidId pins it to always go to one specific kid.
export interface Chore {
  id: string
  title: string
  emoji: string
  points: number
  days: Weekday[] // which weekdays this chore is eligible; empty = every day
  assignedKidId?: string // if set, always assigned to this kid instead of the random pool
  active: boolean
  createdAt: number
}

// The result of randomly handing out today's eligible chores across kids.
// One doc per (dayKey, choreId), computed once per day.
export interface Assignment {
  id: string
  dayKey: string
  choreId: string
  kidId: string
  createdAt: number
}

export type CompletionStatus = 'pending' | 'approved' | 'rejected'

// A kid's submission of proof for a chore. Points are only awarded once a
// parent approves it — submitting alone doesn't touch the kid's points.
export interface Completion {
  id: string
  kidId: string
  choreId: string
  dayKey: string // which chore-cycle day this completion belongs to
  status: CompletionStatus
  photo?: string // proof photo, as a data URL
  video?: string // proof video, as a Firebase Storage download URL
  note?: string // written proof note
  submittedAt: number
  approvedAt?: number
  reviewedAt?: number // set on approve or reject
  rejectionNote?: string
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
  assignments: Assignment[]
  completions: Completion[] // today's completions only
  pendingCompletions: Completion[] // all pending completions, any day — for the parent review queue
  rewards: Reward[]
  redemptions: Redemption[]
  parentPin: string
}
