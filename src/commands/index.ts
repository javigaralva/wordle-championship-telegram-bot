import { onHelpCommandRegex, onHelpCommandHandler } from './onHelpCommand'
import { onPlayerForwardResultCommandHandler, onPlayerForwardResultCommandRegex } from './onPayerForwardResultCommand'
import { onResultsCommandsRegex, onResultsCommandsHandler } from './onResultsCommand'
import { onStartCommandHandler, onStartCommandRegex } from './onStartCommand'

import { onDanceCommandHandler, onDanceCommandRegex } from './easterEggs/onDanceCommand'
import { onWinnerCommandRegex, onWinnerCommandHandler } from './easterEggs/onWinnerCommand'

export const Commands = {
    Dance: {
        handler: onDanceCommandHandler,
        regex: onDanceCommandRegex
    },
    Help: {
        handler: onHelpCommandHandler,
        regex: onHelpCommandRegex
    },
    PlayerForwardResult: {
        handler: onPlayerForwardResultCommandHandler,
        regex: onPlayerForwardResultCommandRegex
    },
    Results: {
        handler: onResultsCommandsHandler,
        regex: onResultsCommandsRegex
    },
    Start: {
        handler: onStartCommandHandler,
        regex: onStartCommandRegex
    },
    Winner: {
        handler: onWinnerCommandHandler,
        regex: onWinnerCommandRegex
    },
}