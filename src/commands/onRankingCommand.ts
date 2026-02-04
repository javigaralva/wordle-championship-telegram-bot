import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { bot } from '../bot/bot'
import { 
    getChampionshipData, 
    getChampionshipGameIdsRangeFromDate 
} from '../services/championship'
import { 
    getDateFromGameId, 
    getTodaysGameId 
} from '../services/gameUtilities'
import { getEndOfChampionshipMessageForPlayer } from '../services/senders'
import { getPlayer } from '../services/admin'

export const onRankingCommandRegex = /#ranking\s+(?<userId>\d+)\s+(?<gameId>\d+)/gm

export async function onRankingCommandHandler( msg: TelegramBot.Message ) {
    const match = onRankingCommandRegex.exec( msg.text ?? '' )
    if( !match || !match.groups ) {
        return await sendInstructions(msg.chat.id)
    }

    const userId = Number( match.groups.userId )
    const gameId = Number( match.groups.gameId )

    const date = getDateFromGameId( gameId )
    const range = getChampionshipGameIdsRangeFromDate( date )
    const todaysGameId = getTodaysGameId()

    // A championship is finished if the today's game ID is strictly greater than the last game ID of the championship range.
    if ( todaysGameId <= range[ 1 ] ) {
        return await sendMessage( msg.chat.id, `El campeonato para el juego #${gameId} aún no ha terminado (rango: #${range[0]} a #${range[1]}).` )
    }

    const player = await getPlayer( userId )
    if ( !player ) {
        return await sendMessage( msg.chat.id, `No se ha encontrado al usuario con ID ${userId}.` )
    }

    const championshipData = await getChampionshipData( { date } )
    const { message, animationId } = getEndOfChampionshipMessageForPlayer( { 
        player, 
        championshipRanking: championshipData.championshipRanking, 
        championshipString: championshipData.championshipString 
    } )

    await sendMessage( msg.chat.id, message )
    if ( animationId ) {
        await bot.sendAnimation( msg.chat.id, animationId )
    }
}

async function sendInstructions(id: number) {
    return await sendMessage(id, `❌ *Invalid command:*\n#ranking <userId> <gameId>`)
}