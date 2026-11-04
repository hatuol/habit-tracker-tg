import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initTelegram } from './telegram'
import './styles.css'

initTelegram()

createApp(App).use(createPinia()).use(router).mount('#app')
