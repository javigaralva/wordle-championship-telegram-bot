export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
export const ALL_PLAYERS_IDS = JSON.parse( process.env.ALL_PLAYERS_IDS ?? '[]' )
export const ADMIN_ID = Number( process.env.ADMIN_ID )