import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'

import { getChampionshipResults, getPlayer, getPlayers, loadDB, resetChampionshipResults, setPlayerResult } from './repository'
import { getScore } from './score'
import { getGameIdFromDate, getTodaysGameId } from './getTodaysGameId'
import { parseForwardResult } from './parser'

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN ?? ''

if( !telegramBotToken ) {
    console.error( '\n\nTELEGRAM_BOT_TOKEN is not set\n\n' )
    process.exit( 1 )
}

const bot = new TelegramBot( telegramBotToken, { polling: true } )

function getDayOfTheWeek( date: Date = new Date() ) {
    const day = date.getUTCDay()
    return day === 0 ? 6 : day - 1
}

function getChampionshipGameIdsRangeFromDate( date: Date = new Date() ): [ number, number ] {
    const dayOfTheWeek = getDayOfTheWeek( date )
    const gameId = getGameIdFromDate( date )
    return [ gameId - dayOfTheWeek, gameId + ( 6 - dayOfTheWeek ) ]
}

function getChampionshipRankingInRange( gameIdsRange: [ number, number ] ) {
    return getPlayers()
        .map( player => ({
            player,
            totalScore: getPlayerTotalScoreInRange( player.id, gameIdsRange )
        }))
        .filter( playerScore => playerScore.totalScore > 0 )
        .sort( ( a, b ) => b.totalScore - a.totalScore )

}

function getPlayerTotalScoreInRange( playerId: number, gameIdsRange: [ number, number ] ) {
    const championshipResults = getChampionshipResults()
    let totalScore = 0
    for( let gameId = gameIdsRange[ 0 ]; gameId <= gameIdsRange[ 1 ]; gameId++ ) {
        const attempts = championshipResults[ gameId ]?.[ playerId ] ?? 0
        totalScore += getScore( attempts )
    }
    return totalScore
}

function attemptsToString( attempts: number ) {
    return attempts === 0 ? 'X' : attempts
}

( async () => {
    await loadDB()
} )()


//
// /start
//
bot.onText( /\/start/, ( msg ) => {
    const text =
        `*Hola ${msg.from?.first_name ?? 'personaje misterioso'}. ¡Bienvenido a Wordle Championship!*\n` +
        'Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        'Para participar solo me tienes que reenviar el resultado desde la web de https://wordle.danielfrg.com/ cuando termines la partida.\n'
    sendMessage( msg.chat.id, text )
} )

//
// User forward a result
//
const WORDLE_RESULT_FORWARD_REGEX = /#(\d+) (\d|X)\/6/gm
bot.onText( WORDLE_RESULT_FORWARD_REGEX, async ( msg ) => {
    const { text } = msg
    const { id, username = '', first_name: name } = msg.chat

    if( !id ) {
        return sendMessage( id, 'No sé quién eres' )
    }

    const parsedResult = parseForwardResult( text ?? '' )

    if( !parsedResult ) {
        return sendMessage( id, 'No te he entendido. Debes de reenviar el texto con el resultado del wordle' )
    }

    const { gameId, attempts } = parsedResult
    const todaysGameId = getTodaysGameId()
    if( gameId !== todaysGameId ) {
        return sendMessage( id, `Has enviado el resultado para el round #${gameId}, pero el actual es el round #${todaysGameId}` )
    }

    const player = {
        id,
        username,
        name: name ?? 'John Doe',
    }

    const playerResult: PlayerResult = {
        player,
        gameId: gameId,
        attempts: attempts,
    }
    await setPlayerResult( playerResult )

    sendMessage( id, `${name}, tu resultado de ${attemptsToString( attempts )}/6 para el juego #${gameId} ha sido registrado` )

} )

bot.onText( /\/results/, async ( msg ) => {
    const resultsByPlayer = getChampionshipResultsByPlayerIdToString( msg.chat.id )
    sendMessage( msg.chat.id, resultsByPlayer )
} )

bot.onText( /\/ranking/, async ( msg ) => {
    const ranking = getChampionshipResultsToString()
    sendMessage( msg.chat.id, ranking )
} )


// ADMIN COMMANDS
bot.onText( /START CHAMP/gm, async ( msg ) => {

    sendMessage( msg.chat.id, 'Comenzando un nuevo campeonato...' )
    await resetChampionshipResults()

    const players = getPlayers()
    sendMessage( msg.chat.id, `Informando a los usuarios (${players.length})...` )

    players.forEach( ( { id, name } ) =>
        sendMessage( id, `${name}, ¡comienza un nuevo campeonato! Para participar, vete enviándome los resultados desde la web de https://wordle.danielfrg.com/ cuando termines la partida.` )
    )

} )

bot.onText( /STOP CHAMP/gm, async ( msg ) => {

    sendMessage( msg.chat.id, 'Finalizando campeonato...' )

    const players = getPlayers()
    sendMessage( msg.chat.id, `Informando a los usuarios (${players.length})...` )

    const ranking = '' // getRankingString()
    players.forEach( ( { id, name } ) =>
        sendMessage( id, `${name}, ¡el campeonato ha finalizado!\nAquí tienes el ranking con los resultados\n\n${ranking}` )
    )

    sendMessage( msg.chat.id, 'Reseteando resultados...' )
    await resetChampionshipResults()

} )

function sendMessage( id: number, text: string ) {
    bot.sendMessage( id, text, { parse_mode: 'Markdown' } )
}

function getChampionshipResultsToString() {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const championshipResults = getChampionshipResults()

    let text = ''
    for( let gameId = gameIdsRange[ 0 ]; gameId <= gameIdsRange[ 1 ]; gameId++ ) {
        const gameResults = championshipResults[ gameId ]
        if( !gameResults ) {
            text += `Juego #${gameId} sin resultados\n\n`
            continue
        }

        text += `Juego #${gameId}\n`
        const gameResultsByPlayer = []
        for( const playerId in gameResults ) {
            const player = getPlayer( Number( playerId ) )
            if( !player ) continue

            const attempts = gameResults[ playerId ]
            if( attempts === undefined ) continue

            gameResultsByPlayer.push( {
                player,
                attempts,
                score: getScore( attempts ),
            } )
        }

        text += gameResultsByPlayer
            .sort( ( a, b ) => b.score - a.score )
            .map( resultByPlayer => `  - ${resultByPlayer.player.name}: ${attemptsToString( resultByPlayer.attempts )}/6 (${resultByPlayer.score} puntos)` )
            .join( '\n' )
        text += '\n\n'
    }

    return text
}

function getChampionshipResultsByPlayerIdToString( playerId: number ) {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const results = getResultsByPlayerIdInRange( playerId, gameIdsRange )
    const gameResultsToString = results
        .map( result => `#${result.gameId} - ${attemptsToString(result.attempts)}/6 (${result.score} puntos)` )
        .join( '\n' )
    const totalScore = getPlayerTotalScoreInRange( playerId, gameIdsRange )
    return `Tus resultados:\n${gameResultsToString}\n\n*Total: ${totalScore} puntos*`
}

function getResultsByPlayerIdInRange( playerId: number, gameIdsRange: [ number, number ] ) {
    const championshipResults = getChampionshipResults()

    const results = []
    for( let gameId = gameIdsRange[ 0 ]; gameId <= gameIdsRange[ 1 ]; gameId++ ) {
        if( championshipResults[ gameId ] ) {
            const attempts = championshipResults[ gameId ]?.[ playerId ] ?? 0
            const score = getScore( attempts )
            results.push( { gameId, attempts, score } )
        }
    }
    return results
}
