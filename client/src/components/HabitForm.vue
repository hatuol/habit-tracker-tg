<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Habit } from '../types'

const props = defineProps<{
  initial?: Partial<Habit> | null
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [payload: { title: string; emoji: string; color: string; targetDays: number[] }]
  cancel: []
}>()

const COLORS = ['#0D9488', '#0369A1', '#4F46E5', '#BE185D', '#B45309', '#15803D', '#0F766E']
const EMOJIS = ['💧', '🏃', '📚', '🧘', '💪', '🥗', '😴', '✍️', '🎯', '🧠', '🌅', '✨']
const DAYS = [
  { id: 1, label: 'Пн' },
  { id: 2, label: 'Вт' },
  { id: 3, label: 'Ср' },
  { id: 4, label: 'Чт' },
  { id: 5, label: 'Пт' },
  { id: 6, label: 'Сб' },
  { id: 7, label: 'Вс' },
]

const form = reactive({
  title: '',
  emoji: '✨',
  color: '#0D9488',
  targetDays: [1, 2, 3, 4, 5, 6, 7] as number[],
})

watch(
  () => props.initial,
  (v) => {
    form.title = v?.title || ''
    form.emoji = v?.emoji || '✨'
    form.color = v?.color || '#0D9488'
    form.targetDays = [...(v?.targetDays || [1, 2, 3, 4, 5, 6, 7])]
  },
  { immediate: true },
)

function toggleDay(id: number) {
  if (form.targetDays.includes(id)) {
    if (form.targetDays.length === 1) return
    form.targetDays = form.targetDays.filter((d) => d !== id)
  } else {
    form.targetDays = [...form.targetDays, id].sort()
  }
}

function onSubmit() {
  const title = form.title.trim()
  if (!title) return
  emit('submit', {
    title,
    emoji: form.emoji,
    color: form.color,
    targetDays: form.targetDays,
  })
}
</script>

<template>
  <form class="form panel" @submit.prevent="onSubmit">
    <label class="block">
      <span>Название</span>
      <input v-model="form.title" class="field" maxlength="80" placeholder="Например, выпить воду" required />
    </label>

    <div class="block">
      <span>Иконка</span>
      <div class="chips">
        <button
          v-for="e in EMOJIS"
          :key="e"
          type="button"
          class="chip"
          :class="{ on: form.emoji === e }"
          @click="form.emoji = e"
        >
          {{ e }}
        </button>
      </div>
    </div>

    <div class="block">
      <span>Цвет</span>
      <div class="chips">
        <button
          v-for="c in COLORS"
          :key="c"
          type="button"
          class="swatch"
          :class="{ on: form.color === c }"
          :style="{ background: c }"
          @click="form.color = c"
        />
      </div>
    </div>

    <div class="block">
      <span>Дни недели</span>
      <div class="days">
        <button
          v-for="d in DAYS"
          :key="d.id"
          type="button"
          class="day"
          :class="{ on: form.targetDays.includes(d.id) }"
          @click="toggleDay(d.id)"
        >
          {{ d.label }}
        </button>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="btn ghost" @click="emit('cancel')">Отмена</button>
      <button type="submit" class="btn">{{ submitLabel || 'Сохранить' }}</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  padding: 18px;
  display: grid;
  gap: 16px;
}

.block {
  display: grid;
  gap: 8px;
}

.block > span {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
}

.chips,
.days {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip,
.day {
  border: 1px solid var(--line);
  background: white;
  border-radius: 14px;
  padding: 8px 10px;
  min-width: 42px;
}

.chip.on,
.day.on {
  border-color: transparent;
  background: var(--teal-deep);
  color: white;
}

.swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
}

.swatch.on {
  outline: 2px solid var(--teal-deep);
  outline-offset: 2px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
