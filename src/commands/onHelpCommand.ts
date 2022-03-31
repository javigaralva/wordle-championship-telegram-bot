import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'

export const onHelpCommandRegex = /\/ayuda/

export async function onHelpCommandHandler( msg: TelegramBot.Message ) {
    await sendMessage( msg.chat.id,
        '*🏆 Wordle Championship 🏆*\n' +
        '🏁 Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        '📨 Para participar solo tienes que *reenviar al bot* el resultado desde la web de https://wordle.danielfrg.com/ cuando termines la partida.\n' +
        '\n' +
        '*Puntuación 📋*\n' +
        '  *👉 Ronda 1*: 21 puntos\n' +
        '  *👉 Ronda 2*: 13 puntos\n' +
        '  *👉 Ronda 3*: 8 puntos\n' +
        '  *👉 Ronda 4*: 5 puntos\n' +
        '  *👉 Ronda 5*: 3 puntos\n' +
        '  *👉 Ronda 6*: 2 puntos\n' +
        '  *👉 Si no aciertas, o no juegas*: 0 puntos.\n' +
        '\n' +
        '*Comandos 📝*\n' +
        '  /start: Inicia el texto de bienvenida.\n' +
        '  /ayuda: Muestra esta ayuda.\n' +
        '  /resultados: Muestra los resultados del campeonato.\n' +
        '  /def *concepto*: Muestra la definición de un concepto.\n' +
        '\n'
    )
}