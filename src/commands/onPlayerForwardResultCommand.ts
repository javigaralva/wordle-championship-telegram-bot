import TelegramBot from 'node-telegram-bot-api'
import { IPlayer } from '../models/Player'
import { IPlayerResult } from '../models/Result'
import { 
    createOrUpdatePlayer, 
    getChampionshipGameIdsRangeFromDate, 
    getResultsByPlayerIdInRange,
    haveAllPlayersPlayedSoFar,
    havePlayerIdPlayedThis, 
    setPlayerResult, 
} from '../services/championship'
import { attemptsToString, getNameWithAvatar, getTodaysGameId } from '../services/gameUtilities'
import { getScore } from '../services/score'
import { getRandomAvatar } from '../utils'
import { sendMessage } from '../bot/sendMessage'
import { sendChampionshipReportTo, sendReport } from '../services/senders'
import { NOTIFICATION_PLAYERS_IDS, WORDLE_TYPE } from '../config/config'

type ParsedResult = {
    gameId: number,
    attempts: number,
    isValid: boolean
}

export const onPlayerForwardResultCommandRegex = {
    NORMAL: /La palabra del d[í|i]a (?:Archivo)?\s*#(\d+) (\d|X)\/6/igm,
    ACCENT: /La palabra del d[í|i]a (?:Modo|Archivo) Tildes\s+#(\d+) (\d|X)\/6/igm,
    SCIENCE: /La palabra cient[í|i]fica\s+#(\d+) (\d|X)\/6/igm,
}[ WORDLE_TYPE ]

export async function onPlayerForwardResultCommandHandler( msg: TelegramBot.Message ) {
    const { text } = msg
    const { id, username = '', first_name: name } = msg.chat

    if( !id ) {
        return await sendMessage( id, '*⁉️ No sé quién eres.*' )
    }

    const parsedResult = parseForwardResult( text ?? '' )

    if( !parsedResult ) {
        return await sendMessage( id, '*❓ No te he entendido.* Debes de reenviar el texto con el resultado del wordle.' )
    }

    if( !parsedResult.isValid ) {
        return await sendMessage( id, '*⚠️ Algo no cuadra.* Por favor, envía el texto del resultado *sin modificar*.' )
    }

    const { gameId, attempts } = parsedResult
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const todaysGameId = getTodaysGameId()

    if( gameId < gameIdsRange[0] || gameId > gameIdsRange[1] ) {
        return await sendMessage( id, `*🚫 Resultado no aceptado.* El juego *#${gameId}* no es parte del campeonato actual. El rango de juegos es *#${gameIdsRange[0]}* a *#${gameIdsRange[1]}*.` )
    }    
    if( gameId > todaysGameId ) {
        return await sendMessage( id, `*🚫 Resultado no aceptado.* Has enviado el resultado para el juego #${gameId}, pero el actual es el juego *#${todaysGameId}*.` )
    }

    const playerResults = await getResultsByPlayerIdInRange(id, gameIdsRange)
    const playerResultForGameId = playerResults.find( r => r.gameId === gameId )
    if( playerResultForGameId ) {
        return await sendMessage( id, `🚫 Tu resultado ya fue registrado con *${attemptsToString( playerResultForGameId.attempts )}/6* para el juego *#${playerResultForGameId.gameId}*. *Obtuviste ${playerResultForGameId.score} puntos*.` )
    }

    const player: IPlayer = {
        id,
        username,
        name: name ?? 'John Doe',
        avatar: getRandomAvatar()
    }

    const playerResult: IPlayerResult = {
        playerId: player.id,
        gameId,
        attempts,
    }

    const playerSaved = await createOrUpdatePlayer( player )
    await setPlayerResult( playerResult )

    const score = await getScore( attempts )
    await sendMessage( id, `✅ *${getNameWithAvatar( playerSaved )}*, tu resultado de *${attemptsToString( attempts )}/6* para el juego *#${gameId}* ha sido registrado.* Has obtenido ${score} puntos*.` )

    // Send notifications
    const notificationText = `ℹ️ *${getNameWithAvatar( playerSaved )}*: *${attemptsToString( attempts )}/6* para el juego *#${gameId}*. *Ha obtenido ${score} puntos*.`
    await sendUserPlayedNotifications( { gameId, notificationText, player } )

    // Send Provisional Ranking to the player, or to all players (if they have played)
    await haveAllPlayersPlayedSoFar()
        ? await sendReport( todaysGameId )
        : await sendChampionshipReportTo( todaysGameId, player.id )
}

async function sendUserPlayedNotifications( { gameId, notificationText, player }: { gameId: number; notificationText: string; player: IPlayer } ) {
    for( const playerIdToBeNotified of NOTIFICATION_PLAYERS_IDS ) {
        if( player.id === playerIdToBeNotified ) continue
        const havePlayerToBeNotifiedPlayed = await havePlayerIdPlayedThis( gameId, playerIdToBeNotified )
        havePlayerToBeNotifiedPlayed && await sendMessage( playerIdToBeNotified, notificationText )
    }
}
export function parseForwardResult( forwardedResult: string ): ParsedResult | undefined {
    const match = onPlayerForwardResultCommandRegex.exec( forwardedResult )
    if( !match ) return

    // reset index so we start at the beginning of the regex each time
    onPlayerForwardResultCommandRegex.lastIndex = 0

    const [ , round, attempts ] = match
    const parsedAttempts = getNumberOfAttempts( forwardedResult )
    const isValid = ( attempts === 'X' ? 6 : parseInt( attempts ) ) === parsedAttempts
    return {
        gameId: parseInt( round ),
        attempts: attempts === 'X' ? 0 : parseInt( attempts ),
        isValid: isValid
    }
}

function getNumberOfAttempts( forwardedResult: string ): number {
    return forwardedResult
        .split( '\n' )
        .filter( o => !o.includes( 'palabra' ) && !o.includes( 'http' ) )
        .filter( Boolean )
        .length
}
