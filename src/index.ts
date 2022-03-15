import 'dotenv/config'
import './lib/db'

import { scheduleReminderToPlay, scheduleSendDailyReport } from './schedulers'
import { getChampionshipData, getChampionshipResultsByPlayerIdToString } from './services/championship'
import { onStartCommandHandler, onStartCommandRegex } from './commands/onStartCommand'
import { onPlayerForwardResultCommandHandler, onPlayerForwardResultCommandRegex } from './commands/onPayerForwardResultCommand'
import { onHelpCommandRegex, onHelpCommandHandler } from './commands/onHelpCommand'
import { onResultsCommandsRegex, onResultsCommandsHandler } from './commands/onResultsCommand'
import { sendDailyReport, sendEndOfChampionshipMessage } from './services/senders'
import { sendMessage } from './bot/sendMessage'
import { bot } from './bot/bot'

scheduleReminderToPlay()
scheduleSendDailyReport()

//
// /start
//
bot.onText( onStartCommandRegex, onStartCommandHandler )

//
// User forward a result
//
bot.onText( onPlayerForwardResultCommandRegex, onPlayerForwardResultCommandHandler )

//
// /ayuda
//
bot.onText( onHelpCommandRegex, onHelpCommandHandler)

//
// /resultados
//
bot.onText( onResultsCommandsRegex, onResultsCommandsHandler )

//
// /winner
//
bot.onText( /\/winner/, async ( msg ) => {
    await bot.sendAnimation( msg.chat.id, 'CgACAgQAAxkBAAPmYjByt9Titm9cLONUiQQ1KZQa4nQAAgQDAAJ-iL1ShzYjDvOzE6YjBA' )
} )

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
