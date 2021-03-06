import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { ADMIN_ID } from '../config/config'
import { addWord } from '../services/admin'
import { getTodaysGameId } from '../services/gameUtilities'

export const onWordCommandRegex = /#word ((?<gameId>\d+) (?<wordGameId>[a-zñáéíóú]+)|(?<word>[a-zñáéíóú]+))/gm

export async function onWordCommandHandler( msg: TelegramBot.Message ) {

    if( ADMIN_ID !== msg.chat.id ) return

    const match = msg.text?.matchAll( onWordCommandRegex )
    if( !match ) return

    const { groups: { gameId, wordGameId, word } } = match.next().value

    const gameIdToSend = gameId ?? getTodaysGameId()
    const wordToSend = word ?? wordGameId

    await addWord( { gameId: gameIdToSend, word: wordToSend } )
    await sendMessage( msg.chat.id, `🎉 La palabra *${wordToSend.toUpperCase()}* ha sido añadida al juego *#${gameIdToSend}*` )
}