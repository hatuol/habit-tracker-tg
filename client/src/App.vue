<script setup lang="ts">
import { onMounted } from 'vue'
import BottomNav from './components/BottomNav.vue'
import { useHabitsStore } from './stores/habits'

const store = useHabitsStore()

onMounted(() => {
  store.fetchHabits()
})
</script>

<template>
  <div class="app-shell">
    <RouterView />
    <BottomNav />
  </div>
</template>
