<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number; size?: number }>()
const size = computed(() => props.size ?? 108)
const r = computed(() => (size.value - 12) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const offset = computed(() => c.value - (Math.min(100, Math.max(0, props.value)) / 100) * c.value)
</script>

<template>
  <div class="ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" viewBox="0 0 108 108">
      <circle class="track" cx="54" cy="54" :r="r" />
      <circle
        class="bar"
        cx="54"
        cy="54"
        :r="r"
        :stroke-dasharray="c"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div class="label">
      <strong class="display">{{ value }}%</strong>
      <span>сегодня</span>
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  display: grid;
  place-items: center;
}

svg {
  transform: rotate(-90deg);
}

.track,
.bar {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
}

.track {
  stroke: rgba(11, 61, 58, 0.1);
}

.bar {
  stroke: url(#grad);
  stroke: #0d9488;
  transition: stroke-dashoffset 0.45s ease;
}

.label {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 2px;
}

.label strong {
  font-size: 26px;
  line-height: 1;
}

.label span {
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 600;
}
</style>
