import TelegramBot from 'node-telegram-bot-api'

import { onHelpCommandRegex, onHelpCommandHandler } from './onHelpCommand'
import { onWordCommandHandler, onWordCommandRegex } from './onWordCommand'
import { onPlayerForwardResultCommandHandler, onPlayerForwardResultCommandRegex } from './onPlayerForwardResultCommand'
import { onStartCommandHandler, onStartCommandRegex } from './onStartCommand'
import { onResultsCommandsRegex, onResultsCommandsHandler } from './onResultsCommand'

import { onDanceCommandHandler, onDanceCommandRegex } from './easterEggs/onDanceCommand'
import { onWinnerCommandRegex, onWinnerCommandHandler } from './easterEggs/onWinnerCommand'

import { ALL_PLAYERS_IDS } from '../config/config'

type CommandHandler = ( msg: TelegramBot.Message ) => Promise<TelegramBot.Message | undefined | void>

const auth = ( handler: CommandHandler ) => async ( msg: TelegramBot.Message ) => {
    const isAuthorized = ALL_PLAYERS_IDS.includes( msg.chat.id )
    if( !isAuthorized ) {
        return console.log( `Unauthorized user (${JSON.stringify( msg.chat )}) tried to execute command ${msg.text}` )
    }

    return handler( msg )
}

export const Commands = {
    Word: {
        handler: auth( onWordCommandHandler ),
        regex: onWordCommandRegex
    },
    Dance: {
        handler: auth( onDanceCommandHandler ),
        regex: onDanceCommandRegex
    },
    Help: {
        handler: auth( onHelpCommandHandler ),
        regex: onHelpCommandRegex
    },
    PlayerForwardResult: {
        handler: auth( onPlayerForwardResultCommandHandler ),
        regex: onPlayerForwardResultCommandRegex
    },
    Results: {
        handler: auth( onResultsCommandsHandler ),
        regex: onResultsCommandsRegex
    },
    Start: {
        handler: auth( onStartCommandHandler ),
        regex: onStartCommandRegex
    },
    Winner: {
        handler: auth( onWinnerCommandHandler ),
        regex: onWinnerCommandRegex
    },
}