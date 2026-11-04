import { getInitData } from './telegram'
import type { CalendarResponse, Habit, StatsResponse } from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  const initData = getInitData()
  if (initData) headers.set('x-telegram-init-data', initData)

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listHabits(date?: string) {
    const url = date ? `/api/habits?date=${encodeURIComponent(date)}` : '/api/habits'
    return request<{ date: string; habits: Habit[] }>(url)
  },
  createHabit(body: { title: string; emoji: string; color: string; targetDays: number[] }) {
    return request<Habit>('/api/habits', { method: 'POST', body: JSON.stringify(body) })
  },
  updateHabit(
    id: number,
    body: Partial<{ title: string; emoji: string; color: string; targetDays: number[]; archived: boolean }>,
  ) {
    return request<Habit>(`/api/habits/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
  },
  deleteHabit(id: number) {
    return request<void>(`/api/habits/${id}`, { method: 'DELETE' })
  },
  toggle(id: number, date?: string) {
    return request<{ habitId: number; date: string; done: boolean; streak: number }>(`/api/habits/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    })
  },
  calendar(month: string) {
    return request<CalendarResponse>(`/api/calendar?month=${month}`)
  },
  stats() {
    return request<StatsResponse>('/api/stats')
  },
}
