import axios from 'axios'

import { getPlayer } from './repository/repository'
import { getTodaysGameId, WORDLE_START_DATE } from './services/gameUtilities'
import { ADMIN_ID, ALL_PLAYERS_IDS, WORDLE_TYPE } from './config/config'
import { sendMessage } from './bot/sendMessage'
import { sendReport } from './services/senders'
import { getChampionshipData, getWordByGameId } from './services/championship'
import { difference } from './utils'
import { addWord } from './services/admin'

export const scheduleReminderToPlay = makeDailyScheduler( {
    hourUTC: 20,
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
    minuteUTC: 5,
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

    const word = await fetchWord( todaysGameId )
    if( !word ) {
        console.error( 'Error getting the word of the day' )
        return retry()
    }

    await addWord( { gameId: todaysGameId, word } )
    sendMessage( ADMIN_ID, `✅ La palabra para el juego *#${todaysGameId}* ha sido añadida.`, true )

    // Schedule next update
    scheduleUpdateWordOfTheDay()

    async function retry() {
        // Retry infinitely until the word is found (or manually added)
        const MAX_RETRIES = Number.MAX_SAFE_INTEGER
        if( numOfRetries > MAX_RETRIES ) {
            console.error( `Max num of retries reached (${MAX_RETRIES}). Scheduling for next day.` )
            return scheduleUpdateWordOfTheDay()
        }
        const MS_DELAY = 60_000
        console.log( `${new Date().toISOString()} >> Retrying to fetch word of the day (${MS_DELAY}ms)...` )
        setTimeout( handleUpdateWordOfTheDay, MS_DELAY )
    }
}

export async function fetchWord( gameId: number ) {
    return await fetchWordFromGithub( gameId )
}

async function fetchWordFromGithub( gameId: number ) {
    try {
        const GITHUB_URL_BASE = 'https://raw.githubusercontent.com/javigaralva/wordle-ES-solutions/main/solutions'
        const url = {
            NORMAL: `${GITHUB_URL_BASE}/solutions-normal.json`,
            ACCENT: `${GITHUB_URL_BASE}/solutions-accent.json`,
            SCIENCE: `${GITHUB_URL_BASE}/solutions-science.json`,
        }[ WORDLE_TYPE ]

        if( !url ) return console.error( `Unknown wordle type: ${WORDLE_TYPE}` )

        console.log( `Fetching word of the day (${url}) ...` )
        const response = await axios.get( url )
        if( !response?.data ) return

        return parseGitHubResponseData( { data: response.data, gameId } )
    }
    catch( error ) {
        console.error( 'Error fetching the word of the day: ', error )
    }
}

function parseGitHubResponseData( { data, gameId }: { data: { gameId: number, word: string }[], gameId: number } ) {
    return data.find( ( { gameId: id } ) => id === gameId )?.word
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
