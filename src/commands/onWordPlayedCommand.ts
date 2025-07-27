import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { WORDLE_TYPE } from '../config/config'
import { IWord } from '../models/Word'
import { getWords } from '../repository/repository'
import { getMissedGamesForPlayerId } from '../services/championship'
import { getTodaysGameId } from '../services/gameUtilities'
import { removeAccents } from '../utils'

export const onWordPlayedCommandRegex = /^\/(jugada\s+)(?<word>.+)/gm

export async function onWordPlayedCommandHandler( msg: TelegramBot.Message ) {

    const match = msg.text?.matchAll( onWordPlayedCommandRegex )
    if( !match ) return

    const { groups: { word } }: { groups: { word: string } } = match.next().value

    const normalizedLowerCaseWord = WORDLE_TYPE === 'NORMAL'
        ? removeAccents(word.toLowerCase())
        : word.toLowerCase()
    
    const todaysGameId = getTodaysGameId()
    const missedGames = await getMissedGamesForPlayerId(msg.chat.id)        
    const words = await getWords()

    const wordFound: IWord | undefined = words
        .find((w: IWord) => {
            if (missedGames.includes(w.gameId)) return false
            if (todaysGameId === w.gameId) return false
            const wordToCompare = WORDLE_TYPE === 'NORMAL'
                ? removeAccents(w.word)
                : w.word
            return wordToCompare.toLowerCase() === normalizedLowerCaseWord
        })

    const textToSend = wordFound
        ? `🕹 La palabra *${wordFound.word.toUpperCase()}* ya fue jugada en la partida *#${wordFound.gameId}*.`
        : `❎ La palabra *${normalizedLowerCaseWord.toUpperCase()}* no ha sido jugada previamente. Puedes usarla en la partida actual 😉`

    await sendMessage(msg.chat.id, textToSend)
}
