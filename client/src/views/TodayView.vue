<script setup lang="ts">
import { computed } from 'vue'
import HabitCheckCard from '../components/HabitCheckCard.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { useHabitsStore } from '../stores/habits'
import { getUserName, haptic } from '../telegram'

const store = useHabitsStore()
const name = getUserName()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
})

const dateLabel = computed(() => {
  if (!store.date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${store.date}T12:00:00`))
})

async function onToggle(id: number) {
  haptic('light')
  await store.toggle(id)
  haptic('success')
}
</script>

<template>
  <section class="today">
    <header class="hero panel">
      <div class="copy">
        <p class="eyebrow">Habit Lab</p>
        <h1 class="display">{{ greeting }}, {{ name }}</h1>
        <p class="muted capitalize">{{ dateLabel }}</p>
        <p class="summary">
          {{ store.doneCount }} из {{ store.scheduled.length }} привычек
        </p>
      </div>
      <ProgressRing :value="store.progress" />
    </header>

    <div v-if="store.loading" class="muted">Загрузка…</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <div v-else-if="!store.habits.length" class="empty panel">
      <h2 class="display">Пока пусто</h2>
      <p class="muted">Добавь первую привычку — и отмечай её каждый день.</p>
      <RouterLink class="btn" to="/habits">Добавить привычку</RouterLink>
    </div>

    <div v-else class="list">
      <HabitCheckCard
        v-for="habit in store.habits"
        :key="habit.id"
        :habit="habit"
        @toggle="onToggle(habit.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.today {
  display: grid;
  gap: 16px;
}

.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 20px;
  overflow: hidden;
  position: relative;
}

.hero::after {
  content: '';
  position: absolute;
  inset: auto -20% -40% 40%;
  height: 160px;
  background: radial-gradient(circle, rgba(94, 234, 212, 0.35), transparent 70%);
  pointer-events: none;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--teal);
}

h1 {
  margin: 0 0 6px;
  font-size: 28px;
  line-height: 1.1;
}

.summary {
  margin: 12px 0 0;
  font-weight: 700;
}

.capitalize {
  text-transform: capitalize;
  margin: 0;
}

.list {
  display: grid;
  gap: 10px;
}

.error {
  color: var(--warn);
  font-weight: 600;
}

.empty .btn {
  display: inline-flex;
  margin-top: 14px;
}
</style>
