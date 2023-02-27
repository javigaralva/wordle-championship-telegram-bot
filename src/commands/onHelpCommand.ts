import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { USE_WORDS_LINKS, WORDLE_TYPE } from '../config/config'

const TEXTS = {
    HEADER: {
        NORMAL: '*🏆 Wordle Championship 🏆*',
        ACCENT: '*🏆 Wordle Championship Tildes 🏆*',
        SCIENCE: '*🏆 Wordle Championship Científico 🏆*',
    }[ WORDLE_TYPE ],
    PARTICIPATE: {
        NORMAL: '📨 Para participar solo tienes que *reenviar al bot* el resultado desde la web de https://lapalabradeldia.com cuando termines la partida.',
        ACCENT: '📨 Para participar solo tienes que *reenviar al bot* el resultado desde la web de https://lapalabradeldia.com/tildes (versión *TILDES*) cuando termines la partida.',
        SCIENCE: '📨 Para participar solo tienes que *reenviar al bot* el resultado desde la web de https://lapalabradeldia.com/ciencia (versión *CIENCIA*) cuando termines la partida.',
    }[ WORDLE_TYPE ],
}

export const onHelpCommandRegex = /\/ayuda/

export async function onHelpCommandHandler( msg: TelegramBot.Message ) {
    await sendMessage( msg.chat.id,
        `${TEXTS.HEADER}\n` +
        '🏁 Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        `${TEXTS.PARTICIPATE}\n` +
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
        '  /rae *palabra*: Muestra las definiciones en la RAE sobre la palabra.\n' +
        '  /jugada *palabra*: Muestra si una palabra ya ha sido jugada en otra partida anterior.\n' +
        '\n' +
        '*NOTA1:* El siguiente ejemplo muestra el esquema de una cabecera de un resultado de juego:\n' +
        '\n' +
        '    *#87* (Lunes) - *SUDAR* | *3.63*/6\n' +
        ( USE_WORDS_LINKS ? '    ✍️ /d\\_E2XAixH | 📚 /r\\_E2XAixH\n' : '' ) +
        '\n' +
        '    *Interpretación de la cabecera:*\n' +
        '    - El juego fue el *#87* y cayó en *Lunes*.\n' +
        '    - La palabra fue *SUDAR*.\n' +
        '    - La media de intentos de todos los jugadores fue de *3.63* sobre 6.\n' +
        ( USE_WORDS_LINKS
            ? ( '    - Si pulsas en /d\\_E2XAixH te mostrará a la definición y ejemplos, si los tuviera, en *Google*.\n' +
                '    - Si pulsas en /r\\_E2XAixH te mostrará la definición en la *RAE*.\n'
            )
            : ''
        )
    )
}