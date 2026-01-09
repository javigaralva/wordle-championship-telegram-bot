import axios from 'axios'
import { CronJob } from 'cron'
import { dispatchGithubWorkflow, ZumbaCommand } from './services/zumba'

const TIMEZONE = 'Europe/Madrid'

const cronJobs: CronJob[] = []
let zumbaWatcherJob: CronJob

interface ZumbaClass {
    ID: string
    SCHEDULER: string
}

interface ZumbaCenter {
    ID: string
    CLASSES: ZumbaClass[]
}

interface ZumbaConfig {
    state: string
    vina: ZumbaCenter
    dehesa: ZumbaCenter
}

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
        .then((config: ZumbaConfig | undefined) => {
            if (config?.vina?.CLASSES) {
                console.log(`Vina Schedulers: ${JSON.stringify(config.vina.CLASSES.map(c => c.SCHEDULER))}`)
                scheduleZumba(config.vina.CLASSES, 'VINA')
            } else {
                console.error(`Can't find classes in config for Vina`)
            }

            if (config?.dehesa?.CLASSES) {
                console.log(`Dehesa Schedulers: ${JSON.stringify(config.dehesa.CLASSES.map(c => c.SCHEDULER))}`)
                scheduleZumba(config.dehesa.CLASSES, 'DEHESA')
            } else {
                console.error(`Can't find classes in config for Dehesa`)
            }
        })
}

function stopAndClearCronJobs() {
    for (const cronJob of cronJobs) {
        cronJob.stop()
    }
    cronJobs.length = 0
}

async function fetchZumbaConfig(): Promise<ZumbaConfig | undefined> {
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

function scheduleZumba(classes: ZumbaClass[] = [], command: ZumbaCommand) {
    console.log(`${new Date().toISOString()} >> Scheduling Zumba ${command}...`)
    for (const zumbaClass of classes) {
        const { ID, SCHEDULER } = zumbaClass
        console.log(`${new Date().toISOString()} - Scheduling ${command} class ${ID} with pattern: '${SCHEDULER}'`)
        const job = new CronJob(SCHEDULER, () => handleReservation(command, ID), null, true, TIMEZONE)
        cronJobs.push(job)
        printNextDates(job)
    }
}

async function handleReservation(command: ZumbaCommand, classId: string) {
    console.log(`Handle ${command} Reservation for class ${classId}...`)
    try {
        await dispatchGithubWorkflow(command, classId)
    } catch (error) {
        console.error(`Error dispatching GithubWorkflow for ${command} (class ${classId})`)
        console.error(error)
    }
}