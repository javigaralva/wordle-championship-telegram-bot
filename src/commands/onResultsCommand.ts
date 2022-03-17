import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { getChampionshipData, haveAllPlayersPlayedThis } from '../services/championship'
import { getTodaysGameId } from '../services/gameUtilities'

export const onResultsCommandsRegex = /\/resultados/

export async function onResultsCommandsHandler( msg: TelegramBot.Message ) {
    const todaysGameId = getTodaysGameId()
    const { championshipResults, championshipString } = await getChampionshipData()
    const hasPlayerPlayedToday = championshipResults.some( ( { gameId, playerId } ) => gameId === todaysGameId && playerId === msg.chat.id )

    const championshipStringToSend = await haveAllPlayersPlayedThis( todaysGameId )
        ? championshipString
        : championshipString.replace( 'RANKING', 'RANKING (provisional)' )

    hasPlayerPlayedToday
        ? await sendMessage( msg.chat.id, championshipStringToSend )
        : await sendMessage( msg.chat.id, '*🚫 Aún no puedes ver los resultados.*\nNo has enviado el resultado de hoy.' )
}