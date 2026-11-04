import { createRouter, createWebHistory } from 'vue-router'
import TodayView from './views/TodayView.vue'
import HabitsView from './views/HabitsView.vue'
import CalendarView from './views/CalendarView.vue'
import StatsView from './views/StatsView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'today', component: TodayView },
    { path: '/habits', name: 'habits', component: HabitsView },
    { path: '/calendar', name: 'calendar', component: CalendarView },
    { path: '/stats', name: 'stats', component: StatsView },
  ],
})
