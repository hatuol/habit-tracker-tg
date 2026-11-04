<script setup lang="ts">
import { onMounted } from 'vue'
import { useHabitsStore } from '../stores/habits'

const store = useHabitsStore()

onMounted(() => {
  store.fetchStats()
})
</script>

<template>
  <section class="page">
    <header>
      <p class="eyebrow">Аналитика</p>
      <h1 class="display">Прогресс</h1>
    </header>

    <div v-if="store.stats" class="kpis">
      <article class="kpi panel">
        <span class="muted">Сегодня</span>
        <strong class="display">{{ store.stats.completedToday }}</strong>
      </article>
      <article class="kpi panel">
        <span class="muted">Активных</span>
        <strong class="display">{{ store.stats.activeHabits }}</strong>
      </article>
      <article class="kpi panel wide">
        <span class="muted">Лучшая серия</span>
        <strong class="display">{{ store.stats.bestStreak }} дн.</strong>
      </article>
    </div>

    <div v-if="store.stats" class="rows">
      <article v-for="h in store.stats.habits" :key="h.id" class="row panel">
        <div class="top">
          <span class="emoji">{{ h.emoji }}</span>
          <div>
            <strong>{{ h.title }}</strong>
            <small class="muted">{{ h.streak }} дн. подряд · {{ h.totalCheckins }} всего</small>
          </div>
          <span class="rate">{{ h.last30Rate }}%</span>
        </div>
        <div class="bar">
          <i :style="{ width: `${h.last30Rate}%`, background: h.color }" />
        </div>
        <p class="hint muted">За 30 дней: {{ h.last30 }} отметок</p>
      </article>
    </div>

    <div v-else class="muted">Считаем статистику…</div>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
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
  font-size: 32px;
}

.kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.kpi {
  padding: 16px;
  display: grid;
  gap: 6px;
}

.kpi.wide {
  grid-column: 1 / -1;
}

.kpi strong {
  font-size: 34px;
  line-height: 1;
}

.rows {
  display: grid;
  gap: 10px;
}

.row {
  padding: 14px 16px;
}

.top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.emoji {
  font-size: 24px;
}

.top small {
  display: block;
  margin-top: 2px;
  font-weight: 600;
}

.rate {
  font-weight: 800;
  color: var(--teal-deep);
}

.bar {
  margin-top: 12px;
  height: 8px;
  border-radius: 999px;
  background: rgba(11, 61, 58, 0.08);
  overflow: hidden;
}

.bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.4s ease;
}

.hint {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 600;
}
</style>
