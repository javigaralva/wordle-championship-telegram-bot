import TelegramBot, { Message } from 'node-telegram-bot-api'
import { bot } from '../../bot/bot'
import { sendMessage } from '../../bot/sendMessage'
import { sleep } from '../../utils'

export const onWinnerCommandRegex = /\/winner/

export async function onWinnerCommandHandler( msg: TelegramBot.Message ) {
    const messages: Message[] = []
    messages.push( await sendMessage( msg.chat.id,
        '*¡Recibido 👌🏻!* No te preocupes, está todo controlado. \n' +
        'Voy a *hackear* el sistema para que ganes 😉\n' +
        'Este mensaje se autodestruirá en...'
    ) )

    await sleep( 3000 )
    for( let i = 3; i > 0; i-- ) {
        await sleep( 1000 )
        messages.push( await sendMessage( msg.chat.id, `*${i}*` ) )
    }

    await sleep( 1000 )

    for( const message of messages ) {
        await bot.deleteMessage( msg.chat.id, String( message.message_id ) )
    }

    const animation = await bot.sendAnimation( msg.chat.id, 'CAACAgIAAxkBAAIBF2Iw6iO89jNVz3rcT0g2wOGRlDZ2AAJJAgACVp29CiqXDJ0IUyEOIwQ' )
    await sleep( 4000 )
    await bot.deleteMessage( msg.chat.id, String( animation.message_id ) )
}