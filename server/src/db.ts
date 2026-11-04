import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data', 'habits.db')

import fs from 'node:fs'
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '✨',
    color TEXT NOT NULL DEFAULT '#0D9488',
    target_days TEXT NOT NULL DEFAULT '1,2,3,4,5,6,7',
    archived INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(habit_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id, archived);
  CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_checkins_habit ON checkins(habit_id, date);
`)

export type HabitRow = {
  id: number
  user_id: number
  title: string
  emoji: string
  color: string
  target_days: string
  archived: number
  sort_order: number
  created_at: string
}

export function upsertUser(user: {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}) {
  db.prepare(
    `INSERT INTO users (id, username, first_name, last_name)
     VALUES (@id, @username, @first_name, @last_name)
     ON CONFLICT(id) DO UPDATE SET
       username = excluded.username,
       first_name = excluded.first_name,
       last_name = excluded.last_name`,
  ).run({
    id: user.id,
    username: user.username ?? null,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
  })
}

export function todayISO(timeZone?: string) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date())
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function calcStreak(dates: string[], upToDate: string): number {
  const set = new Set(dates)
  let streak = 0
  const cursor = new Date(`${upToDate}T12:00:00`)
  // If today is not checked, start from yesterday
  if (!set.has(upToDate)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const key = toDateKey(cursor)
    if (!set.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
