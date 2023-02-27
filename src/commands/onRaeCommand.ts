import TelegramBot from 'node-telegram-bot-api'
import { bot } from '../bot/bot'
import { sendMessage } from '../bot/sendMessage'
import { getRaeDefinitions } from '../services/raeDefinitions'
import { decodeText } from '../utils'

// Examples:
// /rae tongo <=> /r_tongo
export const onRaeCommandRegex = /^\/(rae\s+|r_)(?<search>.+)/gm

export async function onRaeCommandHandler( msg: TelegramBot.Message ) {
    const match = msg.text?.matchAll( onRaeCommandRegex )
    if( !match ) return

    const { groups: { search } } = match.next().value

    const preProcessedWord = search.split( ' ' )[ 0 ]
    const word = msg.text?.startsWith( '/r_') ? decodeText( preProcessedWord ) : preProcessedWord
    if( !word ) return await sendMessage( msg.chat.id, 'ℹ️ Por favor, introduce la palabra a buscar en la RAE. Ejemplos:\n  */rae tongo*\n  */rae engañifa*' )

    const searchUpperCase = word.toUpperCase()
    const message = await sendMessage( msg.chat.id, `Buscando en la RAE *${searchUpperCase}*...` )

    let text: string = await getRaeDefinitions(word)
    text = text
        ? `${text}\n🔗 https://dle.rae.es/${word}`
        : `❌ *No hay datos sobre ${searchUpperCase} en la RAE.*`

    const MAX_TELEGRAM_MESSAGE = 4000
    let textReminder = text
    let messageToSend: string
    let isFirstTime = true
    do {
        messageToSend = textReminder.slice(0, MAX_TELEGRAM_MESSAGE)
        textReminder = textReminder.slice(MAX_TELEGRAM_MESSAGE)
        if (textReminder.length > 0) {
            for (let i = messageToSend.length - 1; i >= 0; i--) {
                const char = messageToSend[i]
                if (char === '\n') break
                textReminder = char + textReminder
                messageToSend = messageToSend.slice(0, i)
            }
        }
        isFirstTime
            ? await bot.editMessageText(messageToSend, {
                chat_id: msg.chat.id,
                message_id: message.message_id,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
            : await sendMessage(msg.chat.id, messageToSend)
        isFirstTime = false
    }
    while (textReminder.length > 0)

}