import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authMiddleware } from './auth.ts'
import { createBot } from './bot.ts'
import { habitsRouter, calendarHandler, statsHandler } from './routes/habits.ts'

const PORT = Number(process.env.PORT || 3000)
const BOT_TOKEN = process.env.BOT_TOKEN || ''
const WEBAPP_URL = process.env.WEBAPP_URL || `http://localhost:${PORT}`
const ALLOW_DEV_AUTH = process.env.ALLOW_DEV_AUTH === '1'
const DEV_USER_ID = Number(process.env.DEV_USER_ID || 1001)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const secure = authMiddleware(BOT_TOKEN, ALLOW_DEV_AUTH, DEV_USER_ID)
app.use('/api/habits', secure, habitsRouter)
app.get('/api/calendar', secure, calendarHandler)
app.get('/api/stats', secure, statsHandler)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).send('Build the client first: cd client && npm run build')
  })
})

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`)
  if (ALLOW_DEV_AUTH) console.log('Dev auth enabled (browser without Telegram OK)')
})

if (BOT_TOKEN) {
  const bot = createBot(BOT_TOKEN, WEBAPP_URL)
  bot.start({
    onStart: (info) => console.log(`Bot @${info.username} started`),
  })
} else {
  console.warn('BOT_TOKEN not set — API runs, bot is disabled')
}
