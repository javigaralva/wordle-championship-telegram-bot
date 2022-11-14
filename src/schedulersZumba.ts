import { CronJob } from 'cron'
import { dispatchGithubWorkflow, ZumbaCommand } from './services/zumba'

const TIMEZONE = 'Europe/Madrid'

export function scheduleZumbaVina() {
    {
        const cronExpression = '0 0 18 * * 0'
        console.log(`${new Date().toISOString()} >> Scheduling Zumba Vina (Sunday at 18:00) with this pattern: '${cronExpression}'`)
        new CronJob(cronExpression, handleVinaReservation, null, true, TIMEZONE )
    }
    {
        const cronExpression = '0 0 19 * * 2'
        console.log(`${new Date().toISOString()} >> Scheduling Zumba Vina (Tuesday at 19:00) with this pattern: '${cronExpression}'`)
        new CronJob(cronExpression, handleVinaReservation, null, true, TIMEZONE)
    }
}

export function scheduleZumbaDehesa() {
    const cronExpression = '0 0 22 * * 0'
    console.log(`${new Date().toISOString()} >> Scheduling Zumba Dehesa (Sunday at 22:00) with this pattern: '${cronExpression}'`)
    new CronJob(cronExpression, handleDehesaReservation, null, true, TIMEZONE)
}

async function handleVinaReservation() {
    await handleReservation('VINA')
}

async function handleDehesaReservation() {
    await handleReservation('DEHESA')
}

async function handleReservation(command: ZumbaCommand) {
    console.log(`Handle ${command} Reservation...`)
    try {
        await dispatchGithubWorkflow(command)
    } catch (error) {
        console.error(`Error dispatching GithubWorkflow for ${command}`)
        console.error(error)
    }
}