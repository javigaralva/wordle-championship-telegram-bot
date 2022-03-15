import { IPlayerResult } from '../models/Result'
import { IPlayer } from '../models/Player'
import { attemptsToString, getDayOfTheWeekFromGameId, getGameIdFromDate, getIconByPosition, getNameWithAvatar, getTodaysGameId } from './gameUtilities'
import * as Repository from '../repository/repository'
import { getScore } from './score'
import { getDayOfTheWeek } from '../utils'

type GameIdsRange = [ number, number ]
type PlayerFinalScore = { player: IPlayer; finalScore: number; }
type ChampionshipRanking = PlayerFinalScore[]

export function createOrUpdatePlayer( player: IPlayer ) {
    return Repository.createOrUpdatePlayer( player )
}

export function findPlayerResultsByGameId( gameId: number ) {
    return Repository.findPlayerResultsByGameId( gameId )
}

export function setPlayerResult( playerResult: IPlayerResult ) {
    return Repository.setPlayerResult( playerResult )
}

export async function getChampionshipData() {
    const championshipResults: IPlayerResult[] = await getChampionshipResults()
    const championshipPlayers = await getChampionshipPlayers( championshipResults )

    const championshipResultsByGameString = await getChampionshipResultsByGameToString( { championshipResults } )
    const championshipRanking = getChampionshipRanking( { championshipResults, championshipPlayers } )
    const championshipRankingString = getChampionshipRankingToString( championshipRanking )

    const championshipString = `*RESULTADOS POR JUEGO 📋*\n${championshipResultsByGameString}*RANKING* 🏆\n${championshipRankingString}`

    return {
        championshipPlayers,
        championshipResults,
        championshipRanking,
        championshipString,
    }
}

export async function getChampionshipPlayers( championshipResults?: IPlayerResult[] ) {
    championshipResults ??= await getChampionshipResults()
    const playersId = [ ... new Set( championshipResults.map( result => result.playerId ) ) ]
    const players = await Repository.findPlayersIn( playersId )
    return players
}

export async function getChampionshipResults() {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const championshipResults: IPlayerResult[] = await Repository.findPlayersResultsIn( gameIdsRange )
    return championshipResults
}

export async function getChampionshipResultsByGameToString( { championshipResults }: { championshipResults: IPlayerResult[] } ) {

    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const currentGameId = getTodaysGameId()

    let text = ''
    for( let gameId = gameIdsRange[ 0 ]; gameId <= gameIdsRange[ 1 ]; gameId++ ) {
        const playerResults = championshipResults.filter( playerResult => playerResult.gameId === gameId )

        if( gameId > currentGameId ) continue

        const gameIdHeader = `*#${gameId}* (${getDayOfTheWeekFromGameId( gameId )})`

        if( !playerResults.length ) {
            text += `${gameIdHeader}\n*  🚫 sin resultados*\n\n`
            continue
        }

        text += `${gameIdHeader}\n`
        const gameResultsByPlayer = []
        for( const playerResult of playerResults ) {
            const player = await Repository.getPlayer( playerResult.playerId )
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

export async function getChampionshipResultsByPlayerIdToString( playerId: number ) {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const results = await getResultsByPlayerIdInRange( playerId, gameIdsRange )
    const gameResultsToString = results
        .map( result => `*#${result.gameId}* (${getDayOfTheWeekFromGameId( result.gameId )}) - ${attemptsToString( result.attempts )}/6 (${result.score} puntos)` )
        .join( '\n' )
    const totalScore = results.reduce( ( score, result ) => score + result.score, 0 )
    return `*TUS RESULTADOS* 📝\n${gameResultsToString}\n\n*TOTAL: ${totalScore} puntos*`
}

async function getResultsByPlayerIdInRange( playerId: number, gameIdsRange: GameIdsRange ) {

    const playerResults = await Repository.findPlayerResultsByPlayerIdInRange( playerId, gameIdsRange )

    return playerResults.map( result => ( {
        gameId: result.gameId,
        attempts: result.attempts,
        score: getScore( result.attempts ),
    } ) )

}

export function getChampionshipRanking(
    { championshipResults, championshipPlayers }: { championshipResults: IPlayerResult[], championshipPlayers: IPlayer[] }
): ChampionshipRanking {
    const playerScore = championshipPlayers
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

export function getChampionshipRankingToString( championshipRanking: ChampionshipRanking ) {
    return championshipRanking
        .map( ( { player, finalScore }, index ) => `*${getIconByPosition( index + 1 )} ${getNameWithAvatar( player )}*: ${finalScore} puntos` )
        .join( '\n' )
}

function getChampionshipGameIdsRangeFromDate( date: Date = new Date() ): GameIdsRange {
    const dayOfTheWeek = getDayOfTheWeek( date )
    const gameId = getGameIdFromDate( date )
    return [ gameId - dayOfTheWeek, gameId + ( 6 - dayOfTheWeek ) ]
}
