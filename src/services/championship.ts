import { IPlayerResult } from '../models/Result'
import { IPlayer } from '../models/Player'
import { IWord } from '../models/Word'
import { attemptsToString, getDayOfTheWeekFromGameId, getGameIdFromDate, getIconByPosition, getNameWithAvatar, getTodaysGameId } from './gameUtilities'
import * as Repository from '../repository/repository'
import { getScore } from './score'
import { getDayOfTheWeek, intersection } from '../utils'
import { ALL_PLAYERS_IDS } from '../config/config'

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
    const championshipWords = await getChampionshipWords()

    const championshipResultsByGameString = await getChampionshipResultsByGameToString( { championshipResults, championshipWords } )
    const championshipRanking = getChampionshipRanking( { championshipResults, championshipPlayers } )
    const championshipRankingString = getChampionshipRankingToString( championshipRanking )

    const championshipString = `*RESULTADOS POR JUEGO 📋*\n\n${championshipResultsByGameString}*RANKING* 🏆\n${championshipRankingString}`

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

export async function getChampionshipWords() {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const words = await Repository.findWordsInRange( gameIdsRange )
    return words
}

export async function getChampionshipResults() {
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const championshipResults: IPlayerResult[] = await Repository.findPlayersResultsIn( gameIdsRange )
    return championshipResults
}

export async function getChampionshipResultsByGameToString( { championshipResults, championshipWords }: { championshipResults: IPlayerResult[], championshipWords: IWord[] } ) {

    const players = await Repository.getPlayers()
    const gameIdsRange = getChampionshipGameIdsRangeFromDate()
    const currentGameId = getTodaysGameId()

    let text = ''
    for( let gameId = gameIdsRange[ 0 ]; gameId <= gameIdsRange[ 1 ]; gameId++ ) {

        if( gameId > currentGameId ) continue

        const playerResults = championshipResults.filter( playerResult => playerResult.gameId === gameId )

        const word = championshipWords.find( word => word.gameId === gameId )
        const gameWord = ( word?.word ?? '' ).toUpperCase()

        const gameWordString = gameWord ? `- *${gameWord}*` : ''
        const gameIdHeader = `*#${gameId}* (${getDayOfTheWeekFromGameId( gameId )}) ${gameWordString}`
        if( !playerResults.length ) {
            text += `${gameIdHeader}\n*  🚫 sin resultados*\n\n`
            continue
        }

        let totalWordScore = 0
        const gameResultsByPlayer = []
        for( const playerResult of playerResults ) {
            const player = players.find( player => player.id === playerResult.playerId )
            if( !player ) continue

            const attempts = playerResult.attempts
            if( attempts === undefined ) continue

            const score = getScore( attempts )
            totalWordScore += score

            gameResultsByPlayer.push( {
                player,
                attempts,
                score,
            } )
        }

        const avgWordScore = ( totalWordScore / gameResultsByPlayer.length ).toFixed( 2 )
        const gameIdHeaderWithScore = `${gameIdHeader} (${avgWordScore} puntos)`

        text += `${gameIdHeaderWithScore}\n`

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

export async function haveAllPlayersPlayedThis( gameId: number ) {
    const todayPlayerResults = await findPlayerResultsByGameId( gameId )
    const todayPlayerIds = todayPlayerResults.map( result => result.playerId )
    const allPlayersHavePlayed = intersection( ALL_PLAYERS_IDS, todayPlayerIds ).length === ALL_PLAYERS_IDS.length
    return allPlayersHavePlayed
}

export async function havePlayerIdPlayedThis( gameId: number, playerId: number ) {
    const playerResults = await findPlayerResultsByGameId( gameId )
    return playerResults.some( result => result.playerId === playerId )
}