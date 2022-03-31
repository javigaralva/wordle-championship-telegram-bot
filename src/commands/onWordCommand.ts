import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { addWord } from '../services/admin'
import { getTodaysGameId } from '../services/gameUtilities'

export const onWordCommandRegex = /#word ((?<gameId>\d+) (?<wordGameId>[a-zñ]+)|(?<word>[a-zñ]+))/gm

export async function onWordCommandHandler( msg: TelegramBot.Message ) {
    const match = msg.text?.matchAll( onWordCommandRegex )
    if( !match ) return

    const { groups: { gameId, wordGameId, word } } = match.next().value

    const gameIdToSend = gameId ?? getTodaysGameId()
    const wordToSend = word ?? wordGameId

    await addWord( { gameId: gameIdToSend, word: wordToSend } )
    await sendMessage( msg.chat.id, `🎉 La palabra *${wordToSend.toUpperCase()}* ha sido añadida al juego *#${gameIdToSend}*` )
}