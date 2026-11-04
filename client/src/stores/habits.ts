import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '../api'
import type { Habit, StatsResponse, CalendarResponse } from '../types'

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([])
  const date = ref('')
  const loading = ref(false)
  const error = ref('')
  const stats = ref<StatsResponse | null>(null)
  const calendar = ref<CalendarResponse | null>(null)

  const scheduled = computed(() => habits.value.filter((h) => h.scheduledToday !== false))
  const doneCount = computed(() => scheduled.value.filter((h) => h.doneToday).length)
  const progress = computed(() => {
    if (!scheduled.value.length) return 0
    return Math.round((doneCount.value / scheduled.value.length) * 100)
  })

  async function fetchHabits() {
    loading.value = true
    error.value = ''
    try {
      const data = await api.listHabits()
      habits.value = data.habits
      date.value = data.date
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
    } finally {
      loading.value = false
    }
  }

  async function toggle(id: number) {
    const habit = habits.value.find((h) => h.id === id)
    if (!habit) return
    const prev = habit.doneToday
    habit.doneToday = !prev
    try {
      const res = await api.toggle(id)
      habit.doneToday = res.done
      habit.streak = res.streak
    } catch (e) {
      habit.doneToday = prev
      error.value = e instanceof Error ? e.message : 'Не удалось отметить'
    }
  }

  async function create(payload: { title: string; emoji: string; color: string; targetDays: number[] }) {
    const created = await api.createHabit(payload)
    habits.value.push(created)
    return created
  }

  async function update(
    id: number,
    payload: Partial<{ title: string; emoji: string; color: string; targetDays: number[]; archived: boolean }>,
  ) {
    const updated = await api.updateHabit(id, payload)
    const idx = habits.value.findIndex((h) => h.id === id)
    if (idx >= 0) {
      if (updated.archived) habits.value.splice(idx, 1)
      else habits.value[idx] = { ...habits.value[idx], ...updated }
    }
    return updated
  }

  async function remove(id: number) {
    await api.deleteHabit(id)
    habits.value = habits.value.filter((h) => h.id !== id)
  }

  async function fetchStats() {
    stats.value = await api.stats()
  }

  async function fetchCalendar(month: string) {
    calendar.value = await api.calendar(month)
  }

  return {
    habits,
    date,
    loading,
    error,
    stats,
    calendar,
    scheduled,
    doneCount,
    progress,
    fetchHabits,
    toggle,
    create,
    update,
    remove,
    fetchStats,
    fetchCalendar,
  }
})
