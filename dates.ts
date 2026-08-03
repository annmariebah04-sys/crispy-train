// Chores run on a daily cycle that ends at 12:00 PM (noon).
// The "chore day" key is the calendar date on which the current cycle started.
export const CYCLE_END_HOUR = 12

export function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function toDayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function getChoreDayKey(now: Date = new Date()): string {
  const d = new Date(now)
  if (d.getHours() < CYCLE_END_HOUR) {
    d.setDate(d.getDate() - 1)
  }
  d.setHours(0, 0, 0, 0)
  return toDayKey(d)
}

export function getWeekdayForDayKey(dayKey: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const [y, m, day] = dayKey.split('-').map(Number)
  return new Date(y, m - 1, day).getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
}

// Next noon deadline for the current chore cycle
export function getNextDeadline(now: Date = new Date()): Date {
  const d = new Date(now)
  d.setHours(CYCLE_END_HOUR, 0, 0, 0)
  if (now.getHours() >= CYCLE_END_HOUR) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

export function formatCountdown(now: Date = new Date()): string {
  const deadline = getNextDeadline(now)
  const diffMs = deadline.getTime() - now.getTime()
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes}m left`
  return `${hours}h ${minutes}m left`
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
