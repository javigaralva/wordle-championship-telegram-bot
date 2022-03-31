import TelegramBot from 'node-telegram-bot-api'
import { bot } from './bot'

export function sendMessage( id: number, text: string, silent = false ) {
    console.log( `${new Date().toISOString()} >> Sending message to ${id}: ${text}` )
    const sendMessageOptions: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
        disable_notification: silent,
        disable_web_page_preview: true
    }
    return bot.sendMessage( id, text, sendMessageOptions )
}
