import TelegramBot from 'node-telegram-bot-api'
import { IPlayer } from '../models/Player'
import { IPlayerResult } from '../models/Result'
import { createOrUpdatePlayer, getChampionshipResultsByPlayerIdToString, haveAllPlayersPlayedThis, setPlayerResult } from '../services/championship'
import { attemptsToString, getNameWithAvatar, getTodaysGameId } from '../services/gameUtilities'
import { getScore } from '../services/score'
import { getRandomAvatar } from '../utils'
import { sendMessage } from '../bot/sendMessage'
import { sendReport } from '../services/senders'

type ParsedResult = {
    gameId: number,
    attempts: number,
    isValid: boolean
}

export const onPlayerForwardResultCommandRegex = /#(\d+) (\d|X)\/6/gm

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
    const todaysGameId = getTodaysGameId()
    if( gameId !== todaysGameId ) {
        return await sendMessage( id, `*🚫 Resultado no aceptado.* Has enviado el resultado para el juego #${gameId}, pero el actual es el juego *#${todaysGameId}*.` )
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
    const playerResults = await getChampionshipResultsByPlayerIdToString( player.id )
    await sendMessage( id, `✅ *${getNameWithAvatar( playerSaved )}*, tu resultado de *${attemptsToString( attempts )}/6* para el juego *#${gameId}* ha sido registrado.* Has obtenido ${score} puntos*.\n\n${playerResults}` )

    setTimeout( async () => await sendReportIfAllPlayersHavePlayed( todaysGameId ), 5000 )
}

export function parseForwardResult( forwardedResult: string ): ParsedResult | undefined {
    const match = /#(\d+) (\d|X)\/6/gm.exec( forwardedResult )
    if( !match ) return

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
        .filter( o => !o.includes( 'ordle' ) )
        .filter( Boolean )
        .length
}

async function sendReportIfAllPlayersHavePlayed( todaysGameId: number ) {
    const allPlayersHavePlayed = await haveAllPlayersPlayedThis( todaysGameId )

    if( !allPlayersHavePlayed ) return

    await sendReport( todaysGameId )
}
