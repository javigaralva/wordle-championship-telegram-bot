import 'dotenv/config'
import './lib/db'

import { Commands } from './commands'

import { scheduleZumbaClasses } from './schedulersZumba'
import { scheduleTadoAssist } from './scheduleTadoAssist'
import { scheduleReminderToPlay, scheduleSendDailyReport, scheduleUpdateWordOfTheDay } from './schedulers'

import { getChampionshipData, getChampionshipResultsByPlayerIdToString } from './services/championship'
import { sendDailyReport, sendEndOfChampionshipMessage } from './services/senders'

import { sendMessage } from './bot/sendMessage'
import { bot } from './bot/bot'
import { ADMIN_ID, WORDLE_TYPE } from './config/config'

// schedule zumba timers (only with NORMAL bot to avoid duplications)
if (WORDLE_TYPE === 'NORMAL') {
    // scheduleZumbaClasses()
    // scheduleTadoAssist()
}

// Schedule reminders and send daily reports
scheduleReminderToPlay()
scheduleSendDailyReport()
scheduleUpdateWordOfTheDay()

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

//
// print all received messages
//
bot.on( 'message', async ( msg ) => {
    console.log( `${new Date().toISOString()} >> Received message: ${JSON.stringify( msg )}` )
    /*
    const text = (msg.text?.toLowerCase() ?? '').trim()
    const hasMatch = Object.values( Commands ).some( command => command.regex.test( text ) )
    if (hasMatch) return;
    
    if(text.startsWith('/')) {
        return await sendMessage( msg.chat.id, '*❌ Parece que intentas usar un comando desconocido.*\nUsa /ayuda para ver la lista de comandos disponibles.' )
    }

    if(text.length > 0) {
        return await sendMessage( msg.chat.id, '*❌ Algo no ha ido bien*.\nSi querías enviar un resultado, vuelve a intentarlo 🔄. Si no funciona, prueba a usar la opción de copiar el resultado al portapapeles del Wordle y pégalo aquí 📋. Si todo eso ha fallado, habla con el administrador 🗣️. Es majo y te ayudará en lo que necesites 😉' )
    }
    */
} )