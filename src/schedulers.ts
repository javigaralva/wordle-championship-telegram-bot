import { getPlayer } from './repository/repository'
import { getTodaysGameId, WORDLE_START_DATE } from './services/gameUtilities'
import { ALL_PLAYERS_IDS } from "./config/config"
import { sendMessage } from "./bot/sendMessage"
import { sendReport } from "./services/senders"
import { getChampionshipData } from './services/championship'
import { difference } from './utils'

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
        await sendMessage( player.id, `*💔 ${player.name}, aún no has participado*.\n¡Ánimo y participa para no quedarte descolgado del campeonato!` )
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
