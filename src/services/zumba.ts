import axios from 'axios'
import { GITHUB_TOKEN } from '../config/config'

export type ZumbaCommand = 'ON' | 'OFF' | 'ESTADO' | 'DEHESA' | 'VINA'
export type ZumbaCommandMap = { [k in ZumbaCommand]: string }
export const ZUMBA_COMMANDS: ZumbaCommandMap = {
    'ON': 'ON',
    'OFF': 'OFF',
    'ESTADO': 'ESTADO',
    'DEHESA': 'DEHESA',
    'VINA': 'VINA',
}
const WORKFLOWS_IDS: ZumbaCommandMap = {
    'ON': 'set-state-on.yml',
    'OFF': 'set-state-off.yml',
    'ESTADO': 'get-state.yml',
    'DEHESA': 'reserva-dehesa.yml',
    'VINA': 'reserva-vina.yml',
}

export async function dispatchGithubWorkflow(command: ZumbaCommand) {
    const auth = GITHUB_TOKEN

    const owner = 'javigaralva'
    const repo = 'zumba-reservation'
    const ref = 'main'
    const workflowId = WORKFLOWS_IDS[command]

    await axios({
        method: 'post',
        url: `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${auth}`
        },
        data: { ref }
    })

    return {
        owner,
        repo,
        ref,
        workflowId
    }
}