<script setup lang="ts">
import type { Habit } from '../types'

defineProps<{ habit: Habit }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    class="card"
    type="button"
    :class="{ done: habit.doneToday, off: habit.scheduledToday === false }"
    :style="{ '--accent': habit.color }"
    @click="emit('toggle')"
  >
    <span class="emoji" aria-hidden="true">{{ habit.emoji }}</span>
    <span class="meta">
      <strong>{{ habit.title }}</strong>
      <small class="muted">
        <template v-if="habit.scheduledToday === false">не в расписании</template>
        <template v-else>{{ habit.streak || 0 }} дн. подряд</template>
      </small>
    </span>
    <span class="check" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M6.5 12.5l3.5 3.5 7.5-8"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.card {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  text-align: left;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 10px 28px rgba(11, 61, 58, 0.06);
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
}

.card:active {
  transform: scale(0.985);
}

.card.done {
  background: color-mix(in srgb, var(--accent) 14%, white);
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

.card.off {
  opacity: 0.55;
}

.emoji {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 24px;
  background: color-mix(in srgb, var(--accent) 16%, white);
}

.meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.meta strong {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta small {
  font-size: 12px;
  font-weight: 600;
}

.check {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--accent) 45%, #cbd5d1);
  color: transparent;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.check svg {
  width: 18px;
  height: 18px;
}

.card.done .check {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
</style>
