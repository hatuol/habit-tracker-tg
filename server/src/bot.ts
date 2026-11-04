import { Bot, InlineKeyboard } from 'grammy'

export function createBot(token: string, webappUrl: string) {
  const bot = new Bot(token)

  const openApp = () =>
    new InlineKeyboard().webApp('Открыть трекер', webappUrl)

  bot.command('start', async (ctx) => {
    await ctx.reply(
      'Привет! Я твой трекер привычек.\n\nОткрой приложение, чтобы добавлять привычки, отмечать дни и смотреть прогресс.',
      { reply_markup: openApp() },
    )
  })

  bot.command('app', async (ctx) => {
    await ctx.reply('Открой трекер привычек:', { reply_markup: openApp() })
  })

  bot.command('help', async (ctx) => {
    await ctx.reply(
      'Команды:\n/start — приветствие\n/app — открыть Mini App\n\nВсе действия — внутри приложения.',
    )
  })

  return bot
}
