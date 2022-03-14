import 'dotenv/config'
import './lib/db'

import TelegramBot from 'node-telegram-bot-api'

import { createOrUpdatePlayer, getPlayer, getPlayers, setPlayerResult } from './repository'
import { getGameIdFromDate, getTodaysGameId } from './getTodaysGameId'
import { getScore } from './score'
import { IPlayer } from './models/Player'
import { IPlayerResult, PlayerResultModel } from './models/Result'
import { parseForwardResult } from './parser'

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN

if( !telegramBotToken ) {
    console.error( '\n\nTELEGRAM_BOT_TOKEN is not set\n\n' )
    process.exit( 1 )
}

const bot = new TelegramBot( telegramBotToken, { polling: true } )

type GameIdsRange = [ number, number ]
type PlayerFinalScore = { player: IPlayer; finalScore: number; }
type ChampionshipRanking = PlayerFinalScore[]

//
// /start
//
bot.onText( /\/start/, ( msg ) => {
    const text =
        `*Hola ${msg.from?.first_name ?? 'personaje misterioso'} 👋. ¡Bienvenido a Wordle Championship!*\n` +
        '🏁 Cada lunes comienza automáticamente un nuevo campeonato.\n' +
        '📨 Para participar solo me tienes que reenviar el resultado desde la web de https://wordle.danielfrg.com/ cuando termines la partida.\n'
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
        return sendMessage( id, '*⁉️ No sé quién eres.*' )
    }

    const parsedResult = parseForwardResult( text ?? '' )

    if( !parsedResult ) {
        return sendMessage( id, '*❓ No te he entendido.* Debes de reenviar el texto con el resultado del wordle.' )
    }

    if( !parsedResult.isValid ) {
        return sendMessage( id, '*⚠️ Algo no cuadra.* Por favor, envía el texto del resultado *sin modificar*.' )
    }

    const { gameId, attempts } = parsedResult
    const todaysGameId = getTodaysGameId()
    if( gameId !== todaysGameId ) {
        return sendMessage( id, `*🚫 Resultado no aceptado.* Has enviado el resultado para el juego #${gameId}, pero el actual es el juego *#${todaysGameId}*.` )
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
    sendMessage( id, `✅ *${getNameWithAvatar( playerSaved )}*, tu resultado de *${attemptsToString( attempts )}/6* para el juego *#${gameId}* ha sido registrado.\n*Has obtenido ${score} puntos*.` )

} )

function getRandomAvatar() {
    const animalEmojis = [ "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🐥", "🐴", "🦄", "🐝", "🐛", "🦋", "🐞", "🪲", "🐢", "🐍", "🦖", "🦕", "🐙", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳" ]
    return animalEmojis[ Math.floor( Math.random() * animalEmojis.length ) ]
}

//
// /resultados
//
bot.onText( /\/resultados/, async ( msg ) => {
    const resultsByPlayer = await getChampionshipResultsByPlayerIdToString( msg.chat.id )
    sendMessage( msg.chat.id, resultsByPlayer )
} )

//
// #ranking
//
bot.onText( /#ranking/, async ( msg ) => {
    const { championshipString } = await getChampionshipData()
    sendMessage( msg.chat.id, championshipString )
} )

//
// #send ranking
//
bot.onText( /#send ranking/, async ( msg ) => {
    const { championshipString } = await getChampionshipData()
    const players: IPlayer[] = await getPlayers()
    players.forEach( player => sendMessage( player.id , championshipString ) )
} )

//
// #send final ranking
//
bot.onText( /#send final ranking/, async ( msg ) => {
    await sendEndOfChampionshipMessage()
} )

async function sendEndOfChampionshipMessage() {
    const { championshipRanking, championshipString } = await getChampionshipData()
    const players: IPlayer[] = await getPlayers()

    const numOfPlayers = championshipRanking.length

    players.forEach( player => {

        const playerPosition = championshipRanking.findIndex( playerFinalScore => playerFinalScore.player.id === player.id ) + 1

        let playerPositionText
        if( playerPosition === 1 ) {
            playerPositionText = `*¡Enhorabuena, ${getNameWithAvatar( player )}!*\n¡Has ganado el campeonato 🏆🏆🏆🏆!`
        }
        else if( playerPosition === 2 ) {
            playerPositionText = `*¡Muy bien, ${getNameWithAvatar( player )}!*\n¡Has quedado en segunda posición en el campeonato!`
        }
        else if( playerPosition === 3 ) {
            playerPositionText = `*¡Bien jugado, ${getNameWithAvatar( player )}!*\n¡Has quedado en tercera posición en el campeonato!`
        }
        else if( playerPosition < numOfPlayers ) {
            playerPositionText = `*¡${getNameWithAvatar( player )}, el campeonato de esta semana ha terminado!*\n'Has quedado en posición ${playerPosition} de ${numOfPlayers} participantes.`
        }
        else {
            playerPositionText = `*¡${getNameWithAvatar( player )}, El campeonato de esta semana ha terminado!*\n'Has quedado último pero no tires la toalla. ¡Pronto empieza el siguiente campeonato!.`
        }

        const finalText = `${playerPositionText}\n\n${championshipString}\n\n¡Te esperamos en el próximo campeonato!`
        sendMessage( player.id, finalText )
    } )
}

function sendMessage( id: number, text: string ) {
    console.log( `${new Date().toISOString()} >> Sending message to ${id}: ${text}` )
    bot.sendMessage( id, text, { parse_mode: 'Markdown' } )
}

function getNameWithAvatar( player: IPlayer ) {
    return `${player.avatar ? `${player.avatar} ` : ''}${player.name}`
}

function getDayOfTheWeek( date: Date = new Date() ) {
    const day = date.getUTCDay()
    return day === 0 ? 6 : day - 1
}

function getChampionshipGameIdsRangeFromDate( date: Date = new Date() ): GameIdsRange {
    const dayOfTheWeek = getDayOfTheWeek( date )
    const gameId = getGameIdFromDate( date )
    return [ gameId - dayOfTheWeek, gameId + ( 6 - dayOfTheWeek ) ]
}

function attemptsToString( attempts: number ) {
    return attempts === 0 ? 'X' : attempts
}

function getIconByPosition ( index: number ) {
    if( index === 1 ) return '🥇'
    if( index === 2 ) return '🥈'
    if( index === 3 ) return '🥉'
    return `${index}.`
}

async function getChampionshipData() {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const championshipResults: IPlayerResult[] = await PlayerResultModel.find( {
        gameId: {
            $gte: gameIdsRange[ 0 ],
            $lte: gameIdsRange[ 1 ]
        }
    } )
    const players = await getPlayers()

    const championshipResultsByGameString = await getChampionshipResultsByGameToString( { gameIdsRange, championshipResults } )
    const championshipRanking = await getChampionshipRanking( { championshipResults, players } )
    const championshipRankingString = getChampionshipRankingToString( championshipRanking )

    return {
        championshipRanking,
        championshipString: `*RESULTADOS POR JUEGO*\n${championshipResultsByGameString}*RANKING*\n${championshipRankingString}`,
    }
}

async function getChampionshipResultsByGameToString( { gameIdsRange, championshipResults }: { gameIdsRange: GameIdsRange, championshipResults: IPlayerResult[] } ) {

    let text = ''
    for( let gameId = gameIdsRange[ 0 ]; gameId <= gameIdsRange[ 1 ]; gameId++ ) {
        const playerResults = championshipResults.filter( playerResult => playerResult.gameId === gameId )
        if( !playerResults.length ) {
            text += `*Juego #${gameId} 🚫 sin resultados*\n\n`
            continue
        }

        text += `*Juego #${gameId}*\n`
        const gameResultsByPlayer = []
        for( const playerResult of playerResults ) {
            const player = await getPlayer( playerResult.playerId )
            if( !player ) continue

            const attempts = playerResult.attempts
            if( attempts === undefined ) continue

            gameResultsByPlayer.push( {
                player,
                attempts,
                score: getScore( attempts ),
            } )
        }

        text += gameResultsByPlayer
            .sort( ( a, b ) => b.score - a.score )
            .map( resultByPlayer => `  *${getNameWithAvatar( resultByPlayer.player )}*: ${attemptsToString( resultByPlayer.attempts )}/6 (${resultByPlayer.score} puntos)` )
            .join( '\n' )

        text += '\n\n'
    }

    return text
}

async function getChampionshipResultsByPlayerIdToString( playerId: number ) {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const results = await getResultsByPlayerIdInRange( playerId, gameIdsRange )
    const gameResultsToString = results
        .map( result => `*Juego #${result.gameId}* - ${attemptsToString(result.attempts)}/6 (${result.score} puntos)` )
        .join( '\n' )
    const totalScore = results.reduce( ( score, result ) => score + result.score, 0 )
    return `*📝 TUS RESULTADOS*:\n${gameResultsToString}\n\n*TOTAL: ${totalScore} puntos*`
}

async function getResultsByPlayerIdInRange( playerId: number, gameIdsRange: GameIdsRange ) {

    const playerResults = await PlayerResultModel.find( {
        playerId,
        gameId: {
            $gte: gameIdsRange[ 0 ],
            $lte: gameIdsRange[ 1 ],
        }
    } )

    return playerResults.map( result => ( {
        gameId: result.gameId,
        attempts: result.attempts,
        score: getScore( result.attempts ),
    } ) )

}

async function getChampionshipRanking(
    { championshipResults, players }: { championshipResults: IPlayerResult[], players: IPlayer[] }
): Promise<ChampionshipRanking> {
    const playerScore = players
        .map( ( player ) => {
            const finalScore = championshipResults
                .filter( result => result.playerId === player.id )
                .reduce( ( score, gameResult ) => score + ( getScore( gameResult.attempts ) ), 0 )
            return {
                player,
                finalScore
            }
        } )
        .sort( ( a, b ) => b.finalScore - a.finalScore )

    return playerScore
}

function getChampionshipRankingToString( championshipRanking: ChampionshipRanking ) {
    return championshipRanking
        .map( ( { player, finalScore }, index ) => `*${getIconByPosition( index + 1 )} ${getNameWithAvatar( player )}*: ${finalScore} puntos` )
        .join( '\n' )
}