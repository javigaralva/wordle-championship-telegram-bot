import { Tado }  from 'node-tado-client';
import { CronJob } from 'cron'

const TIMEZONE = 'Europe/Madrid'

let tadoWatcherJob: CronJob

const tado = new Tado()
let homeId: number

async function loginTado() {
    try {
        const username = process.env.TADO_USERNAME;
        const password = process.env.TADO_PASSWORD;
        console.log("username", username)
        if (!username || !password) {
            return console.warn('No TADO username or password provied. Check TADO_USERNAME/TADO_PASSWORD env variables')
        }
        await tado.login(username, password)
        console.log('Logged in Tado')
        
        const getMeResponse = await tado.getMe();
        homeId = getMeResponse.homes[0].id
        console.log('HomeId: ', homeId)
    } catch(error) {
        console.error(error)
    }
}

export async function scheduleTadoAssist() {
    if (tadoWatcherJob) {
        console.log('Stopping tadoWatcherJob')
        tadoWatcherJob.stop()
    }
    const tadoWatcherJobExpression = '0 */5 * * * *'
    console.log(`Scheduling tadoWatcherJob with this expression: ${tadoWatcherJobExpression}`)
    const onComplete = null
    const startNow = true
    tadoWatcherJob = new CronJob(
        tadoWatcherJobExpression, 
        handleUpdateTadoPresence, 
        onComplete, 
        startNow, 
        TIMEZONE
    )
    
    printNextDates(tadoWatcherJob)
    console.log("Login to Tado")
    await loginTado()

    console.log(`Calling to handleUpdateTadoPresence`)
    await handleUpdateTadoPresence()
}

function printNextDates(job: CronJob, howMany: number = 10) {
    console.log(`${JSON.stringify(job.nextDates(howMany), null, 2)}`)
}

async function handleUpdateTadoPresence() {
    try {
        console.log('handleUpdateTadoPresence')
        const updatePresenceResponse = await tado.updatePresence(homeId)
        console.log(`updatePresenceResponse="${updatePresenceResponse}"`)  
    } catch (error) {
        console.error(error)
    }
}
