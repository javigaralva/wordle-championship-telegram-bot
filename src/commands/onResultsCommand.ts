import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { getChampionshipData } from '../services/championship'
import { getTodaysGameId } from '../services/gameUtilities'

export const onResultsCommandsRegex = /\/resultados/

export async function onResultsCommandsHandler( msg: TelegramBot.Message ) {
    const todaysGameId = getTodaysGameId()
    const { championshipResults, championshipString } = await getChampionshipData()
    const hasPlayerPlayedToday = championshipResults.some( ( { gameId, playerId } ) => gameId === todaysGameId && playerId === msg.chat.id )

    hasPlayerPlayedToday
        ? await sendMessage( msg.chat.id, championshipString )
        : await sendMessage( msg.chat.id, '*🚫 Aún no puedes ver los resultados.*\nNo has enviado el resultado de hoy.' )
}