import { getDateFromGameId, getNameWithAvatar } from './gameUtilities'
import { getChampionshipData } from './championship'
import { bot } from "../bot/bot"
import { sendMessage } from "../bot/sendMessage"

export async function sendReport( todaysGameId: number ) {
    const isSunday = getDateFromGameId( todaysGameId ).getDay() === 0
    isSunday
        ? await sendEndOfChampionshipMessage()
        : await sendDailyReport()
}

export async function sendDailyReport() {
    const { championshipString, championshipPlayers } = await getChampionshipData()
    for( const player of championshipPlayers ) {
        await sendMessage( player.id, championshipString )
    }
}

export async function sendEndOfChampionshipMessage() {
    const { championshipRanking, championshipString, championshipPlayers } = await getChampionshipData()

    const numOfPlayers = championshipRanking.length

    for( const player of championshipPlayers ) {
        const playerPosition = championshipRanking.findIndex( playerFinalScore => playerFinalScore.player.id === player.id ) + 1

        let animationId
        let playerPositionText
        if( playerPosition === 1 ) {
            playerPositionText = `*¡Enhorabuena, ${getNameWithAvatar( player )}!*\n¡Has ganado el campeonato 🏆🏆🏆🏆!`
            animationId = 'CgACAgQAAxkBAAN3Yi-aTM223EN79z-Xx6u4eV2_VI8AAu8CAAJIdbxSwx3H1hHFIlAjBA'
        }
        else if( playerPosition === 2 ) {
            playerPositionText = `*¡Muy bien, ${getNameWithAvatar( player )}!*\n¡Has quedado en segunda posición en el campeonato!`
            animationId = 'CgACAgQAAxkBAAN4Yi-aa03rNJtaNyoegn4q2ddOg3QAAkIDAALwWLxSLA4mnogLB5MjBA'
        }
        else if( playerPosition === 3 ) {
            playerPositionText = `*¡Bien jugado, ${getNameWithAvatar( player )}!*\n¡Has quedado en tercera posición en el campeonato!`
            animationId = 'CgACAgQAAxkBAAN5Yi-ahiQqqhOH-F9oxUFz-ipMylIAAvcCAAI5nbVSDSq2qufqQjYjBA'
        }
        else if( playerPosition < numOfPlayers ) {
            playerPositionText = `*¡${getNameWithAvatar( player )}, el campeonato de esta semana ha terminado!*\n'Has quedado en posición ${playerPosition} de ${numOfPlayers} participantes.`
            animationId = 'CgACAgQAAxkBAAN7Yi-arqyLVfbbQgABM7rahB0sTLUlAALrAgACgLW8UofegweUDiJdIwQ'
        }
        else {
            playerPositionText = `*¡${getNameWithAvatar( player )}, El campeonato de esta semana ha terminado!*\n'Has quedado último pero no tires la toalla. ¡Pronto empieza el siguiente campeonato!.`
            animationId = 'CgACAgQAAxkBAAN6Yi-AMCRNpgpKpHyrCN_cbsHui4AAiMDAAL_jLVSC0YNwQ4n7PEjBA'
        }

        const finalText = `${playerPositionText}\n\n${championshipString}\n\n¡Te esperamos en el próximo campeonato!`
        await sendMessage( player.id, finalText )
        await bot.sendAnimation( player.id, animationId )
    }
}
