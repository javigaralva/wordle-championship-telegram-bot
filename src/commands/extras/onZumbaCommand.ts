import TelegramBot from 'node-telegram-bot-api'
import { sendMessage } from '../../bot/sendMessage'
import { dispatchGithubWorkflow, ZumbaCommand, ZUMBA_COMMANDS } from '../../services/zumba'

export const onZumbaCommandRegex = /\/zumba(\s+(?<command>\w+))?/gm

export async function onZumbaCommandHandler(msg: TelegramBot.Message) {
    const command = await parseInput(msg)
    if (!command) return

    try {
        const { workflowId } = await dispatchGithubWorkflow(command)
        await sendMessage(msg.chat.id, `✅ Comando *${command}* lanzado. Ejecutando workflow '${workflowId}'...`)
    } catch (error) {
        const errorMessage = `❌ Comando *${command}* lanzado con error.`
        console.error(errorMessage)
        console.error(error)
        await sendMessage(msg.chat.id, errorMessage)
    }
}

async function parseInput(msg: TelegramBot.Message) {
    const match = msg.text?.matchAll(onZumbaCommandRegex)
    if (!match) return

    const { groups: { command } } = match.next().value

    const parsedCommand: string = (command ?? '').toUpperCase()

    const isEmptyCommand = !Boolean(parsedCommand)
    const isValidCommand = Object.keys(ZUMBA_COMMANDS).includes(parsedCommand)

    const EMPTY_COMMAND_LINES = [
        'ℹ️ Por favor, el comando a ejecutar. Ejemplos:',
        '  */zumba estado*',
        '  */zumba on*',
        '  */zumba off*',
        '  */zumba vina*',
        '  */zumba dehesa*'
    ]
    const INVALID_COMMAND = [
        '❌ Comando de */zumba* inválido.\n',
        ...EMPTY_COMMAND_LINES
    ]

    if (isEmptyCommand) {
        const message = EMPTY_COMMAND_LINES.join('\n')
        await sendMessage(msg.chat.id, message)
        return
    }
    if (!isValidCommand) {
        const message = INVALID_COMMAND.join('\n')
        await sendMessage(msg.chat.id, message)
        return
    }

    return parsedCommand as ZumbaCommand
}

