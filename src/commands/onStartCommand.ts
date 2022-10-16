import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { WORDLE_TYPE } from '../config/config'

const TEXTS = {
    WELCOME: {
        NORMAL: '👋 ¡Bienvenido a Wordle Championship!',
        ACCENT: '👋 ¡Bienvenido a Wordle Tildes Championship!',
        SCIENCE: '👋 ¡Bienvenido a Wordle Científico Championship!',
    }[ WORDLE_TYPE ],
    PARTICIPATE: {
        NORMAL: '📨 Para participar solo me tienes que reenviar el resultado desde la web de https://https://lapalabradeldia.com cuando termines la partida.',
        ACCENT: '📨 Para participar solo me tienes que reenviar el resultado desde la web de https://https://lapalabradeldia.com/tildes (versión *TILDES*) cuando termines la partida.',
        SCIENCE: '📨 Para participar solo me tienes que reenviar el resultado desde la web de https://https://lapalabradeldia.com/ciencia (versión *CIENTÍFICO*) cuando termines la partida.',
    }[ WORDLE_TYPE ],
}

export const onStartCommandRegex = /\/start/

export async function onStartCommandHandler( msg: TelegramBot.Message ) {
    const text =
        `*Hola ${msg.from?.first_name ?? 'personaje misterioso'} ${TEXTS.WELCOME}*\n` +
        '🏁 Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        `${TEXTS.PARTICIPATE}\n`
    await sendMessage( msg.chat.id, text )
}