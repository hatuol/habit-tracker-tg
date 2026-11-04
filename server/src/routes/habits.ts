import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { calcStreak, db, todayISO, type HabitRow, upsertUser } from '../db.ts'

const habitBody = z.object({
  title: z.string().trim().min(1).max(80),
  emoji: z.string().trim().min(1).max(8).default('✨'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0D9488'),
  targetDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).default([1, 2, 3, 4, 5, 6, 7]),
})

function parseTargetDays(raw: string): number[] {
  return raw.split(',').map(Number).filter((n) => n >= 1 && n <= 7)
}

function serializeHabit(row: HabitRow, extras: Record<string, unknown> = {}) {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    color: row.color,
    targetDays: parseTargetDays(row.target_days),
    archived: Boolean(row.archived),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    ...extras,
  }
}

function weekdayOf(date: string): number {
  // JS: 0=Sun..6=Sat → our: 1=Mon..7=Sun
  const d = new Date(`${date}T12:00:00`)
  const js = d.getDay()
  return js === 0 ? 7 : js
}

export const habitsRouter = Router()

habitsRouter.use((req, _res, next) => {
  if (req.tgUser) upsertUser(req.tgUser)
  next()
})

habitsRouter.get('/', (req, res) => {
  const userId = req.tgUser!.id
  const date = typeof req.query.date === 'string' ? req.query.date : todayISO()
  const includeArchived = req.query.archived === '1'

  const habits = db
    .prepare(
      `SELECT * FROM habits
       WHERE user_id = ? ${includeArchived ? '' : 'AND archived = 0'}
       ORDER BY sort_order ASC, id ASC`,
    )
    .all(userId) as HabitRow[]

  const checkins = db
    .prepare(`SELECT habit_id FROM checkins WHERE user_id = ? AND date = ?`)
    .all(userId, date) as { habit_id: number }[]
  const checked = new Set(checkins.map((c) => c.habit_id))

  const weekday = weekdayOf(date)

  const result = habits.map((h) => {
    const dates = (
      db.prepare(`SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC LIMIT 400`).all(h.id) as {
        date: string
      }[]
    ).map((r) => r.date)

    return serializeHabit(h, {
      doneToday: checked.has(h.id),
      scheduledToday: parseTargetDays(h.target_days).includes(weekday),
      streak: calcStreak(dates, date),
      totalCheckins: dates.length,
    })
  })

  res.json({ date, habits: result })
})

habitsRouter.post('/', (req, res) => {
  const parsed = habitBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const userId = req.tgUser!.id
  const { title, emoji, color, targetDays } = parsed.data
  const maxOrder = (
    db.prepare(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM habits WHERE user_id = ?`).get(userId) as {
      m: number
    }
  ).m

  const info = db
    .prepare(
      `INSERT INTO habits (user_id, title, emoji, color, target_days, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(userId, title, emoji, color, targetDays.join(','), maxOrder + 1)

  const row = db.prepare(`SELECT * FROM habits WHERE id = ?`).get(info.lastInsertRowid) as HabitRow
  res.status(201).json(serializeHabit(row, { doneToday: false, scheduledToday: true, streak: 0, totalCheckins: 0 }))
})

habitsRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  const userId = req.tgUser!.id
  const existing = db.prepare(`SELECT * FROM habits WHERE id = ? AND user_id = ?`).get(id, userId) as HabitRow | undefined
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const body = z
    .object({
      title: z.string().trim().min(1).max(80).optional(),
      emoji: z.string().trim().min(1).max(8).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      targetDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).optional(),
      archived: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    })
    .safeParse(req.body)

  if (!body.success) {
    res.status(400).json({ error: body.error.flatten() })
    return
  }

  const next = {
    title: body.data.title ?? existing.title,
    emoji: body.data.emoji ?? existing.emoji,
    color: body.data.color ?? existing.color,
    target_days: body.data.targetDays ? body.data.targetDays.join(',') : existing.target_days,
    archived: body.data.archived === undefined ? existing.archived : body.data.archived ? 1 : 0,
    sort_order: body.data.sortOrder ?? existing.sort_order,
  }

  db.prepare(
    `UPDATE habits SET title=?, emoji=?, color=?, target_days=?, archived=?, sort_order=? WHERE id=? AND user_id=?`,
  ).run(next.title, next.emoji, next.color, next.target_days, next.archived, next.sort_order, id, userId)

  const row = db.prepare(`SELECT * FROM habits WHERE id = ?`).get(id) as HabitRow
  res.json(serializeHabit(row))
})

habitsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const userId = req.tgUser!.id
  const info = db.prepare(`DELETE FROM habits WHERE id = ? AND user_id = ?`).run(id, userId)
  if (!info.changes) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.status(204).end()
})

habitsRouter.post('/:id/toggle', (req, res) => {
  const id = Number(req.params.id)
  const userId = req.tgUser!.id
  const date = typeof req.body?.date === 'string' ? req.body.date : todayISO()

  const habit = db.prepare(`SELECT * FROM habits WHERE id = ? AND user_id = ? AND archived = 0`).get(id, userId) as
    | HabitRow
    | undefined
  if (!habit) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const existing = db
    .prepare(`SELECT id FROM checkins WHERE habit_id = ? AND date = ?`)
    .get(id, date) as { id: number } | undefined

  let done: boolean
  if (existing) {
    db.prepare(`DELETE FROM checkins WHERE id = ?`).run(existing.id)
    done = false
  } else {
    db.prepare(`INSERT INTO checkins (habit_id, user_id, date) VALUES (?, ?, ?)`).run(id, userId, date)
    done = true
  }

  const dates = (
    db.prepare(`SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC LIMIT 400`).all(id) as { date: string }[]
  ).map((r) => r.date)

  res.json({
    habitId: id,
    date,
    done,
    streak: calcStreak(dates, date),
  })
})

export function calendarHandler(req: Request, res: Response) {
  if (req.tgUser) upsertUser(req.tgUser)
  const userId = req.tgUser!.id
  const month = typeof req.query.month === 'string' ? req.query.month : todayISO().slice(0, 7)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ error: 'month must be YYYY-MM' })
    return
  }

  const from = `${month}-01`
  const toDate = new Date(`${month}-01T12:00:00`)
  toDate.setMonth(toDate.getMonth() + 1)
  const to = toDate.toISOString().slice(0, 10)

  const habits = db
    .prepare(`SELECT id, title, emoji, color FROM habits WHERE user_id = ? AND archived = 0`)
    .all(userId) as { id: number; title: string; emoji: string; color: string }[]

  const rows = db
    .prepare(
      `SELECT date, habit_id FROM checkins
       WHERE user_id = ? AND date >= ? AND date < ?
       ORDER BY date ASC`,
    )
    .all(userId, from, to) as { date: string; habit_id: number }[]

  const byDate: Record<string, number[]> = {}
  for (const row of rows) {
    if (!byDate[row.date]) byDate[row.date] = []
    byDate[row.date].push(row.habit_id)
  }

  res.json({ month, habits, days: byDate })
}

export function statsHandler(req: Request, res: Response) {
  if (req.tgUser) upsertUser(req.tgUser)
  const userId = req.tgUser!.id
  const today = todayISO()
  const habits = db
    .prepare(`SELECT * FROM habits WHERE user_id = ? AND archived = 0 ORDER BY sort_order ASC, id ASC`)
    .all(userId) as HabitRow[]

  const last30Start = new Date(`${today}T12:00:00`)
  last30Start.setDate(last30Start.getDate() - 29)
  const from = last30Start.toISOString().slice(0, 10)

  const stats = habits.map((h) => {
    const dates = (
      db.prepare(`SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC`).all(h.id) as { date: string }[]
    ).map((r) => r.date)
    const inWindow = dates.filter((d) => d >= from && d <= today).length
    const targetDays = parseTargetDays(h.target_days)
    let scheduled = 0
    const cursor = new Date(`${from}T12:00:00`)
    const end = new Date(`${today}T12:00:00`)
    while (cursor <= end) {
      const wd = cursor.getDay() === 0 ? 7 : cursor.getDay()
      if (targetDays.includes(wd)) scheduled += 1
      cursor.setDate(cursor.getDate() + 1)
    }
    return {
      id: h.id,
      title: h.title,
      emoji: h.emoji,
      color: h.color,
      streak: calcStreak(dates, today),
      totalCheckins: dates.length,
      last30: inWindow,
      last30Rate: scheduled ? Math.round((inWindow / scheduled) * 100) : 0,
    }
  })

  const bestStreak = stats.reduce((m, s) => Math.max(m, s.streak), 0)
  const completedToday = (
    db.prepare(`SELECT COUNT(*) AS c FROM checkins WHERE user_id = ? AND date = ?`).get(userId, today) as { c: number }
  ).c

  res.json({
    today,
    completedToday,
    activeHabits: habits.length,
    bestStreak,
    habits: stats,
  })
}
