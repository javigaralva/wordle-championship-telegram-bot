import { bot } from './bot'

export function sendMessage( id: number, text: string, silent = false ) {
    console.log( `${new Date().toISOString()} >> Sending message to ${id}: ${text}` )
    return bot.sendMessage( id, text, { parse_mode: 'Markdown', disable_notification: silent } )
}
