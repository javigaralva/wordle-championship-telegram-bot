import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { ADMIN_ID } from '../config/config'
import { findAuthorizedPlayerByIdentifier, removePlayerResult } from '../services/admin'
import { setPlayerResult } from '../services/championship'
import { attemptsToString, getNameWithAvatar } from '../services/gameUtilities'
import { getScore } from '../services/score'

export const onAddPlayerResultCommandRegex = /#add\s+(?<gameId>\d+)\s+(?<playerIdentifier>.+)\s+(?<attempts>\d+|remove)/gm

export async function onAddPlayerResultCommandHandler(msg: TelegramBot.Message) {

    if (ADMIN_ID !== msg.chat.id) return

    const match = msg.text?.matchAll(onAddPlayerResultCommandRegex)
    if (!match) {
        return await sendInstructions(msg.chat.id)
    }

    const nextMatch = match.next()
    if (nextMatch.done) {
        return await sendInstructions(msg.chat.id)
    }

    const groups = nextMatch.value.groups
    if ( !groups ) {
        return await sendInstructions(msg.chat.id)
    }

    const { gameId, playerIdentifier, attempts } = groups
    
    const isRemove = attempts === 'remove'
    const gameIdNum = Number(gameId)
    const attemptsNum = isRemove ? 0 : Number(attempts)

    if (gameIdNum <= 0 || (!isRemove && attemptsNum < 0)) {
        return await sendInstructions(msg.chat.id)
    }

    const player = await findAuthorizedPlayerByIdentifier(playerIdentifier)
    if (!player) {
        return await sendMessage(msg.chat.id, `⚠️ El jugador *${playerIdentifier}* no existe o no está autorizado.`)
    }

    const playerId = player.id

    if (isRemove) {
        await removePlayerResult({ gameId: gameIdNum, playerId })
        await sendMessage(msg.chat.id, `✅ Resultado del jugador *${getNameWithAvatar(player)}* borrado para el juego *#${gameIdNum}*`)
    }
    else {
        await setPlayerResult({ gameId: gameIdNum, playerId, attempts: attemptsNum })
        const score = await getScore(attemptsNum)
        await sendMessage(msg.chat.id, `✅ Resultado del jugador *${getNameWithAvatar(player)}* de *${attemptsToString(attemptsNum)}/6* para el juego *#${gameIdNum}* ha sido registrado.* Ha obtenido ${score} puntos*.`)
    }
}

async function sendInstructions(id: number) {
    return await sendMessage(id, `❌ *Invalid command:*\n#add <gameId> <playerId|name|avatar> <attempts>|remove`)
}
