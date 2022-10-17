import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { ADMIN_ID } from '../config/config'
import { getPlayer, removePlayerResult } from '../services/admin'
import { setPlayerResult } from '../services/championship'
import { attemptsToString, getNameWithAvatar } from '../services/gameUtilities'
import { getScore } from '../services/score'

type ParsedInput = {
    gameId: number,
    playerId: number,
    attempts: number,
    isValid: boolean,
    isRemove: boolean,
}

export const onAddPlayerResultCommandRegex = /#add ((?<gameId>\d+) (?<playerId>\d+) (?<attempts>(\d+|[xX]|remove)))/gm

export async function onAddPlayerResultCommandHandler(msg: TelegramBot.Message) {

    if (ADMIN_ID !== msg.chat.id) return

    const match = msg.text?.matchAll(onAddPlayerResultCommandRegex)
    if (!match) {
        return await sendInstructions(msg.chat.id)
    }

    const { groups: { gameId, playerId, attempts } } = match.next().value
    const parsedInput = parseInput({ gameId, playerId, attempts })

    if (!parsedInput.isValid) {
        return await sendInstructions(msg.chat.id)
    }

    const player = await getPlayer(playerId)
    if (!player) {
        return await sendMessage(msg.chat.id, `⚠️ El jugador con id *${playerId}* no existe.`)
    }

    if (parsedInput.isRemove) {
        await removePlayerResult({ gameId, playerId })
        await sendMessage(msg.chat.id, `✅ Resultado del jugador *${getNameWithAvatar(player)}* borrado para el juego *#${gameId}*`)
    }
    else {
        await setPlayerResult({ gameId, playerId, attempts })
        const score = await getScore(attempts)
        await sendMessage(msg.chat.id, `✅ Resultado del jugador *${getNameWithAvatar(player)}* de *${attemptsToString(attempts)}/6* para el juego *#${gameId}* ha sido registrado.* Ha obtenido ${score} puntos*.`)
    }
}

async function sendInstructions(id: number) {
    return await sendMessage(id, `❌ *Invalid command:*\n#add <gameId> <playerId> <attempts>|remove`)
}

function parseInput({ gameId, playerId, attempts }: any): ParsedInput {
    const isValid = isCommandValid({ gameId, playerId, attempts })
    return {
        isValid,
        isRemove: attempts === 'remove',
        gameId: Number(gameId),
        playerId: Number(playerId),
        attempts: attempts === 'X' || attempts === 'x' ? 0 : parseInt(attempts),
    }
}

function isCommandValid({ gameId, playerId, attempts }: any) {
    return (
        gameId > 0 &&
        playerId > 0 &&
        (attempts > 0 || attempts === 'x' || attempts === 'X' || attempts === 'remove')
    )
}
