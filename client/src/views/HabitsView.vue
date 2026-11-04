<script setup lang="ts">
import { ref } from 'vue'
import HabitForm from '../components/HabitForm.vue'
import { useHabitsStore } from '../stores/habits'
import { haptic } from '../telegram'
import type { Habit } from '../types'

const store = useHabitsStore()
const mode = ref<'list' | 'create' | 'edit'>('list')
const editing = ref<Habit | null>(null)
function openCreate() {
  editing.value = null
  mode.value = 'create'
}

function openEdit(habit: Habit) {
  editing.value = habit
  mode.value = 'edit'
}

function closeForm() {
  mode.value = 'list'
  editing.value = null
}

async function onCreate(payload: { title: string; emoji: string; color: string; targetDays: number[] }) {
  await store.create(payload)
  haptic('success')
  closeForm()
}

async function onUpdate(payload: { title: string; emoji: string; color: string; targetDays: number[] }) {
  if (!editing.value) return
  await store.update(editing.value.id, payload)
  haptic('success')
  closeForm()
}

async function onDelete(habit: Habit) {
  if (!confirm(`Удалить «${habit.title}»?`)) return
  await store.remove(habit.id)
  haptic('success')
  closeForm()
}

async function archive(habit: Habit) {
  await store.update(habit.id, { archived: true })
  haptic('light')
}
</script>

<template>
  <section class="page">
    <header class="head">
      <div>
        <p class="eyebrow">Управление</p>
        <h1 class="display">Привычки</h1>
      </div>
      <button v-if="mode === 'list'" class="btn" type="button" @click="openCreate">+ Новая</button>
    </header>

    <HabitForm
      v-if="mode === 'create'"
      submit-label="Добавить"
      @submit="onCreate"
      @cancel="closeForm"
    />

    <HabitForm
      v-else-if="mode === 'edit'"
      :initial="editing"
      submit-label="Сохранить"
      @submit="onUpdate"
      @cancel="closeForm"
    />

    <div v-if="mode === 'edit' && editing" class="danger-zone">
      <button class="btn danger" type="button" @click="onDelete(editing)">Удалить привычку</button>
    </div>

    <div v-if="mode === 'list'" class="list">
      <article v-for="habit in store.habits" :key="habit.id" class="item panel">
        <button class="main" type="button" @click="openEdit(habit)">
          <span class="emoji" :style="{ background: habit.color + '22' }">{{ habit.emoji }}</span>
          <span>
            <strong>{{ habit.title }}</strong>
            <small class="muted">{{ habit.streak || 0 }} дн. · {{ habit.totalCheckins || 0 }} отметок</small>
          </span>
        </button>
        <button class="ghost-mini" type="button" @click="archive(habit)">Скрыть</button>
      </article>

      <div v-if="!store.habits.length" class="empty panel">
        <h2 class="display">Создай первую</h2>
        <p class="muted">Выбери иконку, цвет и дни — дальше просто отмечай в «Сегодня».</p>
        <button class="btn" type="button" @click="openCreate">Добавить</button>
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
  align-items: end;
  justify-content: space-between;
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
  font-size: 32px;
}

.list {
  display: grid;
  gap: 10px;
}

.item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 10px 10px 10px 12px;
}

.main {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 4px;
  min-width: 0;
}

.main strong {
  display: block;
}

.main small {
  display: block;
  margin-top: 2px;
  font-weight: 600;
}

.emoji {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.ghost-mini {
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font-weight: 700;
  font-size: 12px;
  padding: 8px;
}

.danger-zone {
  display: flex;
  justify-content: center;
}

.empty .btn {
  margin-top: 12px;
}
</style>
