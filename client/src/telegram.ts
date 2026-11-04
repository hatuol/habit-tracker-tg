export function getWebApp() {
  return window.Telegram?.WebApp
}

export function initTelegram() {
  const wa = getWebApp()
  if (!wa) return null
  wa.ready()
  wa.expand()
  try {
    wa.setHeaderColor('#0B3D3A')
    wa.setBackgroundColor('#F3F7F4')
  } catch {
    /* older clients */
  }
  return wa
}

export function haptic(kind: 'light' | 'success' | 'error' = 'light') {
  const hf = getWebApp()?.HapticFeedback
  if (!hf) return
  if (kind === 'light') hf.impactOccurred('light')
  else hf.notificationOccurred(kind)
}

export function getInitData() {
  return getWebApp()?.initData || ''
}

export function getUserName() {
  const user = getWebApp()?.initDataUnsafe?.user
  if (!user) return 'ты'
  return user.first_name || user.username || 'ты'
}
