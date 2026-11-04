<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { to: '/', label: 'Сегодня', icon: 'sun' },
  { to: '/habits', label: 'Привычки', icon: 'list' },
  { to: '/calendar', label: 'Календарь', icon: 'cal' },
  { to: '/stats', label: 'Прогресс', icon: 'chart' },
] as const
</script>

<template>
  <nav class="nav" aria-label="Навигация">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: route.path === item.to }"
    >
      <span class="icon" aria-hidden="true">
        <svg v-if="item.icon === 'sun'" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else-if="item.icon === 'list'" viewBox="0 0 24 24" fill="none">
          <path d="M8 7h11M8 12h11M8 17h11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="5" cy="7" r="1.2" fill="currentColor" />
          <circle cx="5" cy="12" r="1.2" fill="currentColor" />
          <circle cx="5" cy="17" r="1.2" fill="currentColor" />
        </svg>
        <svg v-else-if="item.icon === 'cal'" viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.8" />
          <path d="M8 3.5V7M16 3.5V7M3.5 10h17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none">
          <path
            d="M5 16l3.5-4.5 3 3L16 9l3 3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M4 20h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </span>
      <span class="label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  left: 50%;
  bottom: calc(10px + var(--safe-bottom));
  transform: translateX(-50%);
  width: min(440px, calc(100% - 20px));
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  border-radius: 24px;
  background: rgba(11, 61, 58, 0.92);
  color: rgba(245, 255, 251, 0.62);
  box-shadow: 0 16px 40px rgba(11, 61, 58, 0.28);
  z-index: 20;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 16px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.nav-item.active {
  background: rgba(94, 234, 212, 0.16);
  color: #ecfffa;
}

.nav-item:active {
  transform: scale(0.96);
}

.icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
}

.icon svg {
  width: 22px;
  height: 22px;
}

.label {
  font-size: 11px;
  font-weight: 600;
}
</style>
