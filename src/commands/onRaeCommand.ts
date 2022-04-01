import TelegramBot from 'node-telegram-bot-api'
import { bot } from '../bot/bot'
import { sendMessage } from "../bot/sendMessage"
import { getRaeDefinitions } from '../services/raeDefinitions'

export const onRaeCommandRegex = /\/rae/

export async function onRaeCommandHandler( msg: TelegramBot.Message ) {
    const word = msg?.text?.split( ' ' )[ 1 ]
    if( !word ) return await sendMessage( msg.chat.id, 'ℹ️ Por favor, introduce la palabra a buscar en la RAE. Ejemplos:\n  */rae tongo*\n  */rae engañifa*' )

    const searchUpperCase = word.toUpperCase()
    const message = await sendMessage( msg.chat.id, `Buscando en la RAE *${searchUpperCase}*...` )

    let text = await getRaeDefinitions( word )
    text = text
        ? `${text}\n🔗 https://dle.rae.es/${word}`
        : `❌ *No hay datos sobre ${searchUpperCase} en la RAE.*\n¿Has olvidado la tilde? 😅\nAdemás, recuerda que no puedes buscar tiempos verbales ni plurales ☝️🤓`


    await bot.editMessageText( text, {
        chat_id: msg.chat.id,
        message_id: message.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    } )

}