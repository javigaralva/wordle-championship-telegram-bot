import TelegramBot from 'node-telegram-bot-api'
import { bot } from '../bot/bot'
import { sendMessage } from '../bot/sendMessage'
import { getGoogleDefinitionsAndExamplesFor } from '../services/googleDefinitions'

export const onDefCommandRegex = /\/def/

export async function onDefCommandHandler( msg: TelegramBot.Message ) {
    const [ , ...searchList ] = msg?.text?.split( ' ' ) ?? []
    const search = searchList.join( ' ' )
    if( !search ) return await sendMessage( msg.chat.id, 'ℹ️ Por favor, introduce lo que quieras definir. Ejemplos:\n  */def pelota vasca*\n  */def mejunje*' )

    const searchUpperCase = search.toUpperCase()
    const message = await sendMessage( msg.chat.id, `Buscando *${searchUpperCase}*...` )

    let text = await getGoogleDefinitionsAndExamplesFor( search )
    text = text || `❌ *No hay datos sobre ${searchUpperCase}*`

    await bot.editMessageText( text, { chat_id: msg.chat.id, message_id: message.message_id, parse_mode: 'Markdown' } )

}