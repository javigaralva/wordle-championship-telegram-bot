import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'

export const onHelpCommandRegex = /\/ayuda/

export async function onHelpCommandHandler( msg: TelegramBot.Message ) {
    await sendMessage( msg.chat.id,
        '*🏆 Wordle Championship 🏆*\n' +
        '🏁 Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        '📨 Para participar solo tienes que *reenviar al bot* el resultado desde la web de https://wordle.danielfrg.com cuando termines la partida.\n' +
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
        '  /resultados: Muestra los resultados del campeonato (ver NOTA1).\n' +
        '  /def *concepto*: Muestra la definición de un concepto.\n' +
        '  /rae *palabra*: Muestras las definiciones en la RAE sobre la palabra.\n' +
        '\n' +
        '*NOTA1:* El siguiente ejemplo muestra el esquema de una cabecera de un resultado de juego:\n' +
        '\n' +
        '    *#89* (Martes) - *DUQUE* | *3.63*/6\n' +
        '    ✍️ /d\\_CLNGfbJ | 📚 /r\\_CLNGfbJ\n' +
        '\n' +
        '    *Interpretación de la cabecera:*\n' +
        '    - El juego fue el *#89* y cayó en *Martes*.\n' +
        '    - La palabra fue *DUQUE*.\n' +
        '    - La media de intentos de todos los jugadores fue de *3.63* sobre 6.\n' +
        '    - Si pulsas en /d\\_CLNGfbJ te mostrará a la definición y ejemplos, si los tuviera, en *Google*.\n' +
        '    - Si pulsas en /r\\_CLNGfbJ te mostrará la definición en la *RAE*.\n'
    )
}