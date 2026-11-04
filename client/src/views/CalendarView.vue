<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHabitsStore } from '../stores/habits'

const store = useHabitsStore()
const cursor = ref(new Date())

const monthKey = computed(() => {
  const y = cursor.value.getFullYear()
  const m = String(cursor.value.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
})

const title = computed(() =>
  new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(cursor.value),
)

const cells = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const first = new Date(year, month, 1)
  const startPad = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalHabits = store.calendar?.habits.length || 0
  const items: { date: string | null; count: number; ratio: number; isToday: boolean }[] = []

  for (let i = 0; i < startPad; i++) items.push({ date: null, count: 0, ratio: 0, isToday: false })

  const today = store.date
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthKey.value}-${String(d).padStart(2, '0')}`
    const count = store.calendar?.days[date]?.length || 0
    items.push({
      date,
      count,
      ratio: totalHabits ? count / totalHabits : 0,
      isToday: date === today,
    })
  }
  return items
})

function shift(delta: number) {
  const next = new Date(cursor.value)
  next.setMonth(next.getMonth() + delta)
  cursor.value = next
}

async function load() {
  await store.fetchCalendar(monthKey.value)
}

onMounted(load)
watch(monthKey, load)
</script>

<template>
  <section class="page">
    <header class="head">
      <div>
        <p class="eyebrow">История</p>
        <h1 class="display capitalize">{{ title }}</h1>
      </div>
      <div class="controls">
        <button class="btn ghost" type="button" @click="shift(-1)">←</button>
        <button class="btn ghost" type="button" @click="shift(1)">→</button>
      </div>
    </header>

    <div class="cal panel">
      <div class="weekdays">
        <span v-for="d in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="d">{{ d }}</span>
      </div>
      <div class="grid">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          class="day"
          :class="{ empty: !cell.date, today: cell.isToday }"
        >
          <template v-if="cell.date">
            <span class="num">{{ Number(cell.date.slice(-2)) }}</span>
            <span
              class="dot"
              :style="{
                opacity: cell.ratio ? 0.25 + cell.ratio * 0.75 : 0.08,
                transform: `scale(${cell.ratio ? 0.7 + cell.ratio * 0.5 : 0.55})`,
              }"
            />
          </template>
        </div>
      </div>
    </div>

    <div v-if="store.calendar?.habits.length" class="legend panel">
      <div v-for="h in store.calendar.habits" :key="h.id" class="leg">
        <span class="swatch" :style="{ background: h.color }" />
        <span>{{ h.emoji }} {{ h.title }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--teal);
}

h1 {
  margin: 0;
  font-size: 30px;
}

.capitalize {
  text-transform: capitalize;
}

.controls {
  display: flex;
  gap: 6px;
}

.controls .btn {
  padding: 10px 14px;
}

.cal {
  padding: 16px;
}

.weekdays,
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.weekdays {
  margin-bottom: 8px;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.day {
  aspect-ratio: 1;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  display: grid;
  place-items: center;
  gap: 2px;
  position: relative;
}

.day.empty {
  background: transparent;
}

.day.today {
  outline: 2px solid var(--teal);
  outline-offset: -2px;
}

.num {
  font-size: 13px;
  font-weight: 700;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--teal);
}

.legend {
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.leg {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
