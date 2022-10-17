import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../bot/sendMessage'
import { ADMIN_ID } from '../config/config'
import { getPlayers } from '../services/admin'

export const onPlayersCommandRegex = /#players/gm

export async function onPlayersCommandHandler(msg: TelegramBot.Message) {

    if (ADMIN_ID !== msg.chat.id) return

    const match = onPlayersCommandRegex.test(msg.text ?? '')
    if (!match) return

    const players = await getPlayers()

    const playersToSend = players.map(player =>
        `${player.id} - ${player.avatar} *${player.name}*`
    ).join('\n')

    await sendMessage(msg.chat.id, playersToSend)
}