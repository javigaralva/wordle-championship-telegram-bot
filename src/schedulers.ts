import axios from 'axios'

import { getPlayer } from './repository/repository'
import { getTodaysGameId, WORDLE_START_DATE } from './services/gameUtilities'
import { ADMIN_ID, ALL_PLAYERS_IDS } from './config/config'
import { sendMessage } from './bot/sendMessage'
import { sendReport } from './services/senders'
import { getChampionshipData, getWordByGameId } from './services/championship'
import { difference } from './utils'
import { addWord } from './services/admin'

export const scheduleReminderToPlay = makeDailyScheduler( {
    hourUTC: 21,
    minuteUTC: 0,
    name: 'Reminder to play',
    handler: handleReminderToPlay
} )

export const scheduleSendDailyReport = makeDailyScheduler( {
    hourUTC: WORDLE_START_DATE.getUTCHours() - 1,
    minuteUTC: 30,
    name: 'Send daily report',
    handler: handleSendDailyReport
} )

export const scheduleUpdateWordOfTheDay = makeDailyScheduler( {
    hourUTC: WORDLE_START_DATE.getUTCHours(),
    minuteUTC: 30,
    name: 'Update Word of the Day',
    handler: handleUpdateWordOfTheDay
} )

function makeDailyScheduler( { hourUTC, minuteUTC, name, handler }: { hourUTC: number, minuteUTC: number, name: string, handler: () => Promise<void> } ) {
    return () => {
        const now = Date.now()
        const date = new Date()
        date.setUTCHours( hourUTC, minuteUTC, 0, 0 )
        let whenMs = date.getTime() - now
        whenMs = whenMs < 0 ? whenMs + 86400000 : whenMs
        console.log( `${new Date().toISOString()} >> Scheduling '${name}' in ${whenMs / 1000} seconds (at ${new Date( now + whenMs ).toISOString()})` )
        setTimeout( handler, whenMs )
    }
}

async function handleReminderToPlay() {
    const playersIdsToRemind = await getPlayersIdsThatDidNotPlayToday()

    for( const playerIdsToRemind of playersIdsToRemind ) {
        const player = await getPlayer( playerIdsToRemind )
        if( !player )
            continue
        await sendMessage( player.id, `*💔 ${player.name}, aún no has participado*.\n¡Ánimo y juega para no quedarte descolgado del campeonato!` )
    }

    // Schedule next reminder
    scheduleReminderToPlay()
}

async function handleSendDailyReport() {
    const todaysGameId = getTodaysGameId()
    const playersIdsThatDidNotPlayToday = await getPlayersIdsThatDidNotPlayToday()

    // If all players have played, the report was already sent when last player played
    if( playersIdsThatDidNotPlayToday.length > 0 ) {
        const silent = true
        await sendReport( todaysGameId, silent )
    }

    // Schedule next daily report
    scheduleSendDailyReport()
}

async function handleUpdateWordOfTheDay() {
    let numOfRetries = 0
    const todaysGameId = getTodaysGameId()

    const wordOfTheDay = await getWordByGameId( todaysGameId )
    if( wordOfTheDay ) {
        console.log( `${new Date().toISOString()} >> Word of the day has been already added.` )
        return scheduleUpdateWordOfTheDay()
    }

    const response = await fetchWord( todaysGameId )
    if( !response?.data ) return retry()

    const word = parseResponseData( response.data )
    if( !word ) {
        numOfRetries++
        console.error( 'Error parsing the word of the day' )
        return retry()
    }

    await addWord( { gameId: todaysGameId, word } )
    sendMessage( ADMIN_ID, `✅ La palabra para el juego *#${todaysGameId}* ha sido añadida.`, true )

    // Schedule next update
    scheduleUpdateWordOfTheDay()

    async function retry() {
        const MAX_RETRIES = 5
        if( numOfRetries > MAX_RETRIES ) {
            console.error( `Max num of retries reached (${MAX_RETRIES}). Scheduling for next day.` )
            return scheduleUpdateWordOfTheDay()
        }
        const MS_DELAY = 60_000
        console.log( `${new Date().toISOString()} >> Retrying to fetch word of the day (${MS_DELAY}ms)...` )
        setTimeout( handleUpdateWordOfTheDay, MS_DELAY )
    }
}

async function fetchWord( gameId: number ) {
    try {
        const url = `https://www.gamereactor.es/wordle-2${gameId + 1}-y-wordle-es-${gameId}-solucion-con-la-palabra-del-reto-de-hoy/`
        console.log( `Fetching word of the day (${url}) ...` )
        return await axios.get( url )
    }
    catch( error ) {
        console.error( 'Error fetching the word of the day' )
    }
}

function parseResponseData( data: string ): string | undefined {
    const match = data.matchAll( /solución del reto de Wordle hoy, es (?<word>.{5})/gm )
    const { groups: { word } } = match.next().value ?? { groups: { word: undefined } }
    return word?.toLowerCase()
}

async function getPlayersIdsThatDidNotPlayToday() {
    const todaysGameId = getTodaysGameId()
    const { championshipPlayers, championshipResults } = await getChampionshipData()
    const todaysPlayersIds = championshipResults
        .filter( result => result.gameId === todaysGameId )
        .map( result => result.playerId )

    const allPlayersIds = ALL_PLAYERS_IDS.length > championshipPlayers.length
        ? ALL_PLAYERS_IDS
        : championshipPlayers.map( player => player.id )

    const playersIdsToRemind = difference( allPlayersIds, todaysPlayersIds )
    return playersIdsToRemind
}
