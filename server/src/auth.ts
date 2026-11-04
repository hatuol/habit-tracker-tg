import crypto from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

export type TgUser = {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

declare global {
  namespace Express {
    interface Request {
      tgUser?: TgUser
    }
  }
}

function parseInitData(initData: string): URLSearchParams {
  return new URLSearchParams(initData)
}

export function validateInitData(initData: string, botToken: string, maxAgeSec = 86400): TgUser | null {
  const params = parseInitData(initData)
  const hash = params.get('hash')
  if (!hash) return null

  params.delete('hash')
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  if (calculated !== hash) return null

  const authDate = Number(params.get('auth_date') || 0)
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null

  const userRaw = params.get('user')
  if (!userRaw) return null
  try {
    const user = JSON.parse(userRaw) as TgUser
    if (!user?.id) return null
    return user
  } catch {
    return null
  }
}

export function authMiddleware(botToken: string, allowDev: boolean, devUserId: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const initData = req.header('x-telegram-init-data') || ''

    if (initData && botToken) {
      const user = validateInitData(initData, botToken)
      if (!user) {
        res.status(401).json({ error: 'Invalid Telegram init data' })
        return
      }
      req.tgUser = user
      next()
      return
    }

    if (allowDev) {
      req.tgUser = {
        id: Number(req.header('x-dev-user-id') || devUserId),
        first_name: 'Dev',
        username: 'dev',
      }
      next()
      return
    }

    res.status(401).json({ error: 'Unauthorized' })
  }
}
