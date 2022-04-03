import 'dotenv/config'
import './lib/db'

import { Commands } from './commands'

import { scheduleReminderToPlay, scheduleSendDailyReport } from './schedulers'

import { getChampionshipData, getChampionshipResultsByPlayerIdToString } from './services/championship'
import { sendDailyReport, sendEndOfChampionshipMessage } from './services/senders'

import { sendMessage } from './bot/sendMessage'
import { bot } from './bot/bot'
import { ADMIN_ID } from './config/config'

// Schedule reminders and send daily reports
scheduleReminderToPlay()
scheduleSendDailyReport()

// Register all bot commands
for( const command of Object.values( Commands ) ) {
    bot.onText( command.regex, command.handler )
}

//
// /mis_resultados
//
bot.onText( /\/mis_resultados/, async ( msg ) => {
    const resultsByPlayer = await getChampionshipResultsByPlayerIdToString( msg.chat.id )
    await sendMessage( msg.chat.id, resultsByPlayer )
} )

//
// #ranking
//
bot.onText( /#ranking/, async ( msg ) => {
    if( ADMIN_ID !== msg.chat.id ) return
    const { championshipString } = await getChampionshipData()
    await sendMessage( msg.chat.id, championshipString )
} )

//
// #send ranking
//
bot.onText( /#send ranking/, async ( msg ) => {
    await sendDailyReport()
} )

//
// #send final ranking
//
bot.onText( /#send final ranking/, async ( msg ) => {
    await sendEndOfChampionshipMessage()
} )
