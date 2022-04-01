import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'

export const onStartCommandRegex = /\/start/

export async function onStartCommandHandler( msg: TelegramBot.Message ) {
    const text =
        `*Hola ${msg.from?.first_name ?? 'personaje misterioso'} 👋 ¡Bienvenido a Wordle Championship!*\n` +
        '🏁 Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        '📨 Para participar solo me tienes que reenviar el resultado desde la web de https://wordle.danielfrg.com cuando termines la partida.\n'
    await sendMessage( msg.chat.id, text )
}