import 'dotenv/config'
import './lib/db'

import { Commands } from './commands'

import { scheduleReminderToPlay, scheduleSendDailyReport } from './schedulers'

import { getChampionshipData, getChampionshipResultsByPlayerIdToString } from './services/championship'
import { getDefinitionsAndExamplesFor } from './services/wordDefinitions'
import { sendDailyReport, sendEndOfChampionshipMessage } from './services/senders'

import { sendMessage } from './bot/sendMessage'
import { bot } from './bot/bot'

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

//
// /def word
//
bot.onText( /\/def/, async ( msg ) => {
    const [ , ...searchList ] = msg?.text?.split( ' ' ) ?? []
    const search = searchList.join( ' ' )
    if( !search ) return await sendMessage( msg.chat.id, 'ℹ️ Por favor, introduce lo que quieras definir. Ejemplos:\n  */def pelota vasca*\n  */def mejunje*' )

    const searchUpperCase = search.toUpperCase()
    const message = await sendMessage( msg.chat.id, `Buscando *${searchUpperCase}*...` )

    let text = await getDefinitionsAndExamplesFor( search )
    text = text || `☠️ No hay datos sobre *${searchUpperCase}*`

    await bot.editMessageText( text, { chat_id: msg.chat.id, message_id: message.message_id, parse_mode: 'Markdown' } )
} )
