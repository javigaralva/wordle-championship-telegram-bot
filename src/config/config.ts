type WordleTypes = 'NORMAL' | 'ACCENT' | 'SCIENCE'

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
export const ALL_PLAYERS_IDS = JSON.parse( process.env.ALL_PLAYERS_IDS ?? '[]' )
export const ADMIN_ID = Number( process.env.ADMIN_ID )
export const NOTIFICATION_PLAYERS_IDS = JSON.parse( process.env.NOTIFICATION_PLAYERS_IDS ?? '[]' )
export const WORDLE_TYPE: WordleTypes = process.env.WORDLE_TYPE as WordleTypes ?? 'NORMAL'
export const USE_WORDS_LINKS: Boolean = Boolean( process.env.USE_WORDS_LINKS ) && process.env.USE_WORDS_LINKS?.toLocaleLowerCase() === 'true'