import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db, familyId } from './firebase'
import type { AppData, Chore, Completion, Kid, Redemption, Reward, Weekday } from '../types'
import { getChoreDayKey } from './dates'

const KID_COLORS = ['violet', 'teal', 'rose'] as const

const familyRef = () => doc(db, 'families', familyId)
const kidsCol = () => collection(db, 'families', familyId, 'kids')
const choresCol = () => collection(db, 'families', familyId, 'chores')
const completionsCol = () => collection(db, 'families', familyId, 'completions')
const rewardsCol = () => collection(db, 'families', familyId, 'rewards')
const redemptionsCol = () => collection(db, 'families', familyId, 'redemptions')

// Firestore rejects `undefined` field values (used here to mean "clear this
// field", e.g. removing a photo) — swap them for deleteField() sentinels.
function cleanPatch(patch: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) out[k] = v === undefined ? deleteField() : v
  return out
}

// Runs as a transaction so two devices opening the app for the very first
// time at the same moment can't both win the "family doc doesn't exist yet"
// check and each seed their own set of duplicate kids — Firestore retries
// the loser against the winner's committed doc, and it sees the doc now
// exists and backs off.
async function ensureSeeded() {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(familyRef())
    if (snap.exists()) return

    const now = Date.now()
    tx.set(familyRef(), { parentPin: '1234', createdAt: now })

    const seedKids: Array<Pick<Kid, 'name' | 'emoji' | 'color'>> = [
      { name: 'Kid One', emoji: '🦋', color: KID_COLORS[0] },
      { name: 'Kid Two', emoji: '⚡', color: KID_COLORS[1] },
      { name: 'Kid Three', emoji: '🔥', color: KID_COLORS[2] },
    ]
    // Offset each createdAt by index — orderBy('createdAt') needs distinct
    // values to keep seed order stable, since a shared timestamp would leave
    // the tie-break to Firestore's arbitrary document ID ordering.
    seedKids.forEach((k, i) => {
      tx.set(doc(kidsCol()), { ...k, points: 0, totalEarned: 0, createdAt: now + i })
    })

    const seedRewards: Array<Pick<Reward, 'title' | 'emoji' | 'cost'>> = [
      { title: '30 min extra screen time', emoji: '📱', cost: 20 },
      { title: 'Pick the movie night film', emoji: '🎬', cost: 30 },
      { title: 'Late bedtime (Fri/Sat)', emoji: '🌙', cost: 40 },
      { title: '$5 cash', emoji: '💵', cost: 60 },
    ]
    seedRewards.forEach((r, i) => {
      tx.set(doc(rewardsCol()), { ...r, active: true, createdAt: now + i })
    })
  })
}

interface StoreApi {
  data: AppData
  today: string
  loading: boolean
  addKid: (name: string, emoji: string, color: string) => Promise<void>
  updateKid: (id: string, patch: Partial<Pick<Kid, 'name' | 'emoji' | 'color' | 'photo' | 'background'>>) => Promise<void>
  removeKid: (id: string) => Promise<void>
  addChore: (kidId: string, title: string, emoji: string, points: number, days: Weekday[]) => Promise<void>
  updateChore: (id: string, patch: Partial<Pick<Chore, 'title' | 'emoji' | 'points' | 'days' | 'active'>>) => Promise<void>
  removeChore: (id: string) => Promise<void>
  toggleComplete: (kidId: string, choreId: string) => Promise<void>
  addReward: (title: string, emoji: string, cost: number) => Promise<void>
  updateReward: (id: string, patch: Partial<Pick<Reward, 'title' | 'emoji' | 'cost' | 'active'>>) => Promise<void>
  removeReward: (id: string) => Promise<void>
  redeemReward: (kidId: string, rewardId: string) => Promise<boolean>
  fulfillRedemption: (id: string) => Promise<void>
  cancelRedemption: (id: string) => Promise<void>
  setParentPin: (pin: string) => Promise<void>
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [kids, setKids] = useState<Kid[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [parentPin, setParentPinLocal] = useState('1234')
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set())
  const [today, setToday] = useState(() => getChoreDayKey())

  const markLoaded = (key: string) => setLoadedKeys((prev) => (prev.has(key) ? prev : new Set(prev).add(key)))

  useEffect(() => {
    ensureSeeded()
  }, [])

  useEffect(() => {
    const unsubs = [
      onSnapshot(familyRef(), (snap) => {
        setParentPinLocal((snap.data()?.parentPin as string) ?? '1234')
        markLoaded('settings')
      }),
      onSnapshot(query(kidsCol(), orderBy('createdAt')), (snap) => {
        setKids(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Kid))
        markLoaded('kids')
      }),
      onSnapshot(query(choresCol(), orderBy('createdAt')), (snap) => {
        setChores(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chore))
        markLoaded('chores')
      }),
      onSnapshot(completionsCol(), (snap) => {
        setCompletions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Completion))
        markLoaded('completions')
      }),
      onSnapshot(query(rewardsCol(), orderBy('createdAt')), (snap) => {
        setRewards(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reward))
        markLoaded('rewards')
      }),
      onSnapshot(redemptionsCol(), (snap) => {
        setRedemptions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Redemption))
        markLoaded('redemptions')
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const key = getChoreDayKey()
      setToday((prev) => (prev === key ? prev : key))
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  const data: AppData = useMemo(
    () => ({ kids, chores, completions, rewards, redemptions, parentPin }),
    [kids, chores, completions, rewards, redemptions, parentPin],
  )
  const loading = loadedKeys.size < 6

  const api = useMemo<StoreApi>(() => {
    return {
      data,
      today,
      loading,
      async addKid(name, emoji, color) {
        await addDoc(kidsCol(), { name, emoji, color, points: 0, totalEarned: 0, createdAt: Date.now() })
      },
      async updateKid(id, patch) {
        await updateDoc(doc(kidsCol(), id), cleanPatch(patch))
      },
      async removeKid(id) {
        const batch = writeBatch(db)
        batch.delete(doc(kidsCol(), id))
        for (const col of [choresCol(), completionsCol(), redemptionsCol()]) {
          const snap = await getDocs(query(col, where('kidId', '==', id)))
          snap.forEach((d) => batch.delete(d.ref))
        }
        await batch.commit()
      },
      async addChore(kidId, title, emoji, points, days) {
        await addDoc(choresCol(), { kidId, title, emoji, points, days, active: true, createdAt: Date.now() })
      },
      async updateChore(id, patch) {
        await updateDoc(doc(choresCol(), id), cleanPatch(patch))
      },
      async removeChore(id) {
        const batch = writeBatch(db)
        batch.delete(doc(choresCol(), id))
        const snap = await getDocs(query(completionsCol(), where('choreId', '==', id)))
        snap.forEach((d) => batch.delete(d.ref))
        await batch.commit()
      },
      async toggleComplete(kidId, choreId) {
        const chore = chores.find((c) => c.id === choreId)
        if (!chore) return
        const dayKey = getChoreDayKey()
        const compRef = doc(completionsCol(), `${kidId}_${choreId}_${dayKey}`)
        const kidRef = doc(kidsCol(), kidId)
        await runTransaction(db, async (tx) => {
          const [compSnap, kidSnap] = await Promise.all([tx.get(compRef), tx.get(kidRef)])
          if (!kidSnap.exists()) return
          const kidData = kidSnap.data() as Kid
          if (compSnap.exists()) {
            tx.delete(compRef)
            tx.update(kidRef, {
              points: Math.max(0, kidData.points - chore.points),
              totalEarned: Math.max(0, kidData.totalEarned - chore.points),
            })
          } else {
            tx.set(compRef, { kidId, choreId, dayKey, completedAt: Date.now() })
            tx.update(kidRef, {
              points: kidData.points + chore.points,
              totalEarned: kidData.totalEarned + chore.points,
            })
          }
        })
      },
      async addReward(title, emoji, cost) {
        await addDoc(rewardsCol(), { title, emoji, cost, active: true, createdAt: Date.now() })
      },
      async updateReward(id, patch) {
        await updateDoc(doc(rewardsCol(), id), cleanPatch(patch))
      },
      async removeReward(id) {
        const batch = writeBatch(db)
        batch.delete(doc(rewardsCol(), id))
        const snap = await getDocs(query(redemptionsCol(), where('rewardId', '==', id)))
        snap.forEach((d) => batch.delete(d.ref))
        await batch.commit()
      },
      async redeemReward(kidId, rewardId) {
        const reward = rewards.find((r) => r.id === rewardId)
        if (!reward) return false
        const kidRef = doc(kidsCol(), kidId)
        const newRedemptionRef = doc(redemptionsCol())
        try {
          await runTransaction(db, async (tx) => {
            const kidSnap = await tx.get(kidRef)
            if (!kidSnap.exists()) throw new Error('missing-kid')
            const kidData = kidSnap.data() as Kid
            if (kidData.points < reward.cost) throw new Error('insufficient-points')
            tx.update(kidRef, { points: kidData.points - reward.cost })
            tx.set(newRedemptionRef, {
              kidId,
              rewardId,
              cost: reward.cost,
              requestedAt: Date.now(),
              fulfilled: false,
            })
          })
          return true
        } catch {
          return false
        }
      },
      async fulfillRedemption(id) {
        await updateDoc(doc(redemptionsCol(), id), { fulfilled: true, fulfilledAt: Date.now() })
      },
      async cancelRedemption(id) {
        const redemption = redemptions.find((r) => r.id === id)
        if (!redemption) return
        const redRef = doc(redemptionsCol(), id)
        const kidRef = doc(kidsCol(), redemption.kidId)
        await runTransaction(db, async (tx) => {
          const kidSnap = await tx.get(kidRef)
          tx.delete(redRef)
          if (kidSnap.exists()) {
            tx.update(kidRef, { points: (kidSnap.data() as Kid).points + redemption.cost })
          }
        })
      },
      async setParentPin(pin) {
        await setDoc(familyRef(), { parentPin: pin }, { merge: true })
      },
    }
  }, [data, today, loading, chores, rewards, redemptions])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
