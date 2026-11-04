# Habit Lab — Telegram Mini App

Трекер привычек как полноценное приложение внутри Telegram: отметки за день, серии, календарь и статистика.

## Стек

- **Mini App:** Vue 3 + Vite + TypeScript + Pinia
- **API / бот:** Node.js + Express + SQLite + Grammy

## Быстрый старт (локально в браузере)

```bash
# терминал 1
cd server
copy .env.example .env   # Windows
npm install
npm run dev

# терминал 2
cd client
npm install
npm run dev
```

Открой http://localhost:5173 — при `ALLOW_DEV_AUTH=1` приложение работает без Telegram.

## Подключение к Telegram

1. Создай бота у [@BotFather](https://t.me/BotFather) → получи `BOT_TOKEN`.
2. Создай Mini App у BotFather (`/newapp`) и укажи HTTPS-URL фронта.
3. Для локальной разработки подними туннель, например:

```bash
cloudflared tunnel --url http://localhost:5173
# или
npx localtunnel --port 5173
```

4. Пропиши в `server/.env`:

```env
BOT_TOKEN=123:ABC...
WEBAPP_URL=https://your-tunnel-url
ALLOW_DEV_AUTH=0
PORT=3000
```

5. Запусти сервер и клиент. В боте: `/start` → кнопка «Открыть трекер».

> Mini App в Telegram требует **HTTPS**. Локальный `http://localhost` внутри Telegram не откроется — нужен туннель.

## Прод-сборка

```bash
npm run build
npm start
```

Сервер раздаёт `client/dist` и API на одном порту.

## Бесплатный хостинг (Render)

1. Залей репозиторий на GitHub.
2. На [render.com](https://render.com) → **New → Blueprint** → выбери репозиторий (`render.yaml`).
3. Укажи env:
   - `BOT_TOKEN` — токен от @BotFather
   - `WEBAPP_URL` — URL сервиса вида `https://habit-tracker-tg.onrender.com`
4. В BotFather привяжи Mini App к этому `WEBAPP_URL`.

**Важно:** бесплатный план засыпает ~через 15 минут без трафика. Первый заход может занять ~30–60 сек. Чтобы реже засыпал — бесплатный пинг раз в 10–14 мин на `https://YOUR.onrender.com/api/health` (например [cron-job.org](https://cron-job.org)). Лимит Render: ~750 часов/месяц на workspace.

## Возможности

- Добавление / редактирование / удаление привычек
- Иконка, цвет, дни недели
- Отметка за сегодня с haptic-откликом
- Серии (streak)
- Календарь месяца
- Статистика за 30 дней
