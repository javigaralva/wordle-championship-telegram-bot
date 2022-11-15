import axios from 'axios'
import { CronJob } from 'cron'
import { dispatchGithubWorkflow, ZumbaCommand } from './services/zumba'

const TIMEZONE = 'Europe/Madrid'

const cronJobs: CronJob[] = []
let zumbaWatcherJob: CronJob

export function scheduleZumbaClasses() {
    if (zumbaWatcherJob) {
        console.log('Stopping zumbaWatcherJob')
        zumbaWatcherJob.stop()
    }
    const zumbaWatcherJobExpression = '0 50 8,17 * * *'
    console.log(`Scheduling zumbaWatcherJob with this expression: ${zumbaWatcherJobExpression}`)
    zumbaWatcherJob = new CronJob(zumbaWatcherJobExpression, scheduleZumbaClassesInternal, null, true, TIMEZONE)
    printNextDates(zumbaWatcherJob)

    console.log(`Calling to scheduleZumbaClassesInternal`)
    scheduleZumbaClassesInternal()
}

function printNextDates(job: CronJob, howMany: number = 10) {
    console.log(`${JSON.stringify(job.nextDates(howMany), null, 2)}`)
}

function scheduleZumbaClassesInternal() {
    console.log('Re-Scheduling Zumba classes')
    stopAndClearCronJobs()
    fetchZumbaConfig()
        .then(config => {
            config?.vina.SCHEDULERS
                ? console.log(`Vina Schedulers: ${JSON.stringify(config.vina.SCHEDULERS)}`)
                : console.error(`Can't find schedulers in config for Vina` )
            config?.dehesa.SCHEDULERS
                ? console.log(`Dehesa Schedulers: ${JSON.stringify(config.dehesa.SCHEDULERS)}`)
                : console.error(`Can't find schedulers in config for Dehesa` )
            scheduleZumbaVina(config?.vina.SCHEDULERS)
            scheduleZumbaDehesa(config?.dehesa.SCHEDULERS)
        })
}

function stopAndClearCronJobs() {
    for (const cronJob of cronJobs) {
        cronJob.stop()
    }
    cronJobs.length = 0
}

async function fetchZumbaConfig() {
    try {
        const url = 'https://raw.githubusercontent.com/javigaralva/zumba-reservation/main/config/config.json'

        console.log(`Fetching Zumba config (${url}) ...`)
        const response = await axios.get(url)
        return response?.data
    }
    catch (error) {
        console.error('Error fetching Zumba Config')
    }
}

const DEFAULT_VINA_SCHEDULERS = ['0 0 18 * * 0', '0 0 19 * * 2']
function scheduleZumbaVina(cronExpressions: string[] = DEFAULT_VINA_SCHEDULERS) {
    console.log(`${new Date().toISOString()} >> Scheduling Zumba Vina...`)
    schedule(cronExpressions, handleVinaReservation)
}

const DEFAULT_DEHESA_SCHEDULERS = ['0 0 22 * * 0']
function scheduleZumbaDehesa(cronExpressions: string[] = DEFAULT_DEHESA_SCHEDULERS) {
    console.log(`${new Date().toISOString()} >> Scheduling Zumba Dehesa...`)
    schedule(cronExpressions, handleDehesaReservation)
}

function schedule(cronExpressions: string[] = [], handler: () => Promise<void>) {
    for (const cronExpression of cronExpressions) {
        console.log(`${new Date().toISOString()} - Scheduling with this pattern: '${cronExpression}'`)
        const job = new CronJob(cronExpression, handler, null, true, TIMEZONE)
        cronJobs.push(job)
        printNextDates(job)
    }
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