import TelegramBot, { Message } from 'node-telegram-bot-api'
import { bot } from '../../bot/bot'
import { sendMessage } from '../../bot/sendMessage'
import { sleep } from '../../utils'

export const onDanceCommandRegex = /\/dance/

export async function onDanceCommandHandler( msg: TelegramBot.Message ) {

    await sendMessage( msg.chat.id, `*Let's dance! 🕺🏻*` )
    await sleep( 1000 )

    await bot.sendVideo( msg.chat.id, 'https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif' )
    await sleep( 1000 )

    const lyrics = [
        '🎵 🎶 _Never gonna give you up_ 🎶 🎵',
        '🎵 🎶 _Never gonna let you down_ 🎶 🎵',
        '🎵 🎶 _Never gonna run around and desert you_ 🎶 🎵',
        '🎵 🎶 _Never gonna make you cry_ 🎶 🎵',
        '🎵 🎶 _Never gonna say goodbye_ 🎶 🎵',
        '🎵 🎶 _Never gonna tell a lie and hurt you_ 🎶 🎵',
    ]

    for( const lyric of lyrics ) {
        await sendMessage( msg.chat.id, lyric )
        await sleep( 2000 )
    }
}