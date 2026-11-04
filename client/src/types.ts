export type Habit = {
  id: number
  title: string
  emoji: string
  color: string
  targetDays: number[]
  archived: boolean
  sortOrder: number
  createdAt: string
  doneToday?: boolean
  scheduledToday?: boolean
  streak?: number
  totalCheckins?: number
}

export type HabitStats = {
  id: number
  title: string
  emoji: string
  color: string
  streak: number
  totalCheckins: number
  last30: number
  last30Rate: number
}

export type StatsResponse = {
  today: string
  completedToday: number
  activeHabits: number
  bestStreak: number
  habits: HabitStats[]
}

export type CalendarResponse = {
  month: string
  habits: { id: number; title: string; emoji: string; color: string }[]
  days: Record<string, number[]>
}
