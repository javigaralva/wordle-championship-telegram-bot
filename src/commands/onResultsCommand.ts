import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { getChampionshipDataForPlayerId, getChampionshipGameIdsRangeFromDate, haveAllPlayersPlayedThis } from '../services/championship'
import { getTodaysGameId } from '../services/gameUtilities'

export const onResultsCommandsRegex = /\/resultados/

export async function onResultsCommandsHandler( msg: TelegramBot.Message ) {
    const todaysGameId = getTodaysGameId()
    
    const { championshipResults, championshipString } = await getChampionshipDataForPlayerId( { playerId: msg.chat.id } )
    
    const [ startGameId ] = getChampionshipGameIdsRangeFromDate()
    let hasPlayerMissedGames = false
    for( let iGameId = startGameId; iGameId <= todaysGameId; iGameId++ ) {
        const hasPlayerPlayed = championshipResults.some( ( { gameId, playerId } ) => gameId === iGameId && playerId === msg.chat.id )
        if ( !hasPlayerPlayed ) {
            hasPlayerMissedGames = true
            break
        }
    }

    let championshipStringToSend = championshipString
    
    if( hasPlayerMissedGames ) {
        championshipStringToSend = championshipString.replace( 'RANKING', '⚠️ RANKING (solo en tus partidas) ⚠️' )
    }
    else if( !(await haveAllPlayersPlayedThis( todaysGameId ) ) ) {
        championshipStringToSend = championshipString.replace( 'RANKING', 'RANKING (provisional)' )
    }
        
    await sendMessage( msg.chat.id, championshipStringToSend )
}