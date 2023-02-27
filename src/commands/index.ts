import TelegramBot from 'node-telegram-bot-api'

import { onAddPlayerResultCommandHandler, onAddPlayerResultCommandRegex } from './onAddPlayerResultCommand'
import { onDefCommandHandler, onDefCommandRegex } from './onDefCommand'
import { onHelpCommandHandler, onHelpCommandRegex } from './onHelpCommand'
import { onPlayerForwardResultCommandHandler, onPlayerForwardResultCommandRegex } from './onPlayerForwardResultCommand'
import { onPlayersCommandHandler, onPlayersCommandRegex } from './onPlayersCommand'
import { onRaeCommandHandler, onRaeCommandRegex } from './onRaeCommand'
import { onResultsCommandsHandler, onResultsCommandsRegex } from './onResultsCommand'
import { onStartCommandHandler, onStartCommandRegex } from './onStartCommand'
import { onWordCommandHandler, onWordCommandRegex } from './onWordCommand'
import { onWordPlayedCommandHandler, onWordPlayedCommandRegex } from './onWordPlayedCommand'

import { onDanceCommandHandler, onDanceCommandRegex } from './easterEggs/onDanceCommand'
import { onWinnerCommandHandler, onWinnerCommandRegex } from './easterEggs/onWinnerCommand'

import { onZumbaCommandHandler, onZumbaCommandRegex } from './extras/onZumbaCommand'

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
    AddPlayerResult: {
        handler: auth( onAddPlayerResultCommandHandler ),
        regex: onAddPlayerResultCommandRegex
    },
    Def: {
        handler: auth( onDefCommandHandler ),
        regex: onDefCommandRegex
    },
    Help: {
        handler: auth( onHelpCommandHandler ),
        regex: onHelpCommandRegex
    },
    PlayerForwardResult: {
        handler: auth( onPlayerForwardResultCommandHandler ),
        regex: onPlayerForwardResultCommandRegex
    },
    Players: {
        handler: auth( onPlayersCommandHandler ),
        regex: onPlayersCommandRegex
    },
    Rae: {
        handler: auth( onRaeCommandHandler ),
        regex: onRaeCommandRegex
    },
    Results: {
        handler: auth( onResultsCommandsHandler ),
        regex: onResultsCommandsRegex
    },
    Start: {
        handler: auth( onStartCommandHandler ),
        regex: onStartCommandRegex
    },
    Word: {
        handler: auth(onWordCommandHandler),
        regex: onWordCommandRegex
    },
    WordPlayed: {
        handler: auth(onWordPlayedCommandHandler),
        regex: onWordPlayedCommandRegex
    },

    // Easter eggs
    Dance: {
        handler: auth(onDanceCommandHandler),
        regex: onDanceCommandRegex
    },
    Winner: {
        handler: auth( onWinnerCommandHandler ),
        regex: onWinnerCommandRegex
    },

    // Extras
    Zumba: {
        handler: auth(onZumbaCommandHandler),
        regex: onZumbaCommandRegex
    }
}