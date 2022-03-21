import { getDateFromGameId, getNameWithAvatar } from './gameUtilities'
import { getChampionshipData } from './championship'
import { bot } from "../bot/bot"
import { sendMessage } from "../bot/sendMessage"

export async function sendReport( todaysGameId: number, silent = false ) {
    const isSunday = getDateFromGameId( todaysGameId ).getDay() === 0
    isSunday
        ? await sendEndOfChampionshipMessage( silent )
        : await sendDailyReport( silent )
}

export async function sendDailyReport( silent = false ) {
    const { championshipString, championshipPlayers } = await getChampionshipData()
    for( const player of championshipPlayers ) {
        await sendMessage( player.id, championshipString, silent )
    }
}

export async function sendEndOfChampionshipMessage( silent = false ) {
    const { championshipRanking, championshipString, championshipPlayers } = await getChampionshipData()

    const numOfPlayers = championshipRanking.length

    for( const player of championshipPlayers ) {
        const playerPosition = championshipRanking.findIndex( playerFinalScore => playerFinalScore.player.id === player.id ) + 1

        let animationId
        let playerPositionText
        if( playerPosition === 1 ) {
            playerPositionText =
                `*¡Enhorabuena, ${getNameWithAvatar( player )}!*\n` +
                `¡Has ganado el campeonato 🏆🏆🏆🏆!`
            animationId = 'CAACAgIAAxkBAANoYi-Sa0NMq_8VR2XliI-cIUBp-DUAAkoCAAJWnb0KyWrGaGAYevAjBA'
        }
        else if( playerPosition === 2 ) {
            playerPositionText =
                `*¡Muy bien, ${getNameWithAvatar( player )}!*\n` +
                `¡Has quedado en segunda posición en el campeonato!`
            animationId = 'CAACAgIAAxkBAAIBE2Iw5xV3u8TFI7Vc2yn09RIR0aTgAAKLBwACjC39B7OqoghZQedEIwQ'
        }
        else if( playerPosition === 3 ) {
            playerPositionText =
                `*¡Bien jugado, ${getNameWithAvatar( player )}!*\n` +
                `¡Has quedado en tercera posición en el campeonato!`
            animationId = 'CAACAgIAAxkBAAIBFGIw6FBtjqYPJbBZ3v2mhDAJyv6oAAL-AANWnb0K2gRhMC751_8jBA'
        }
        else if( playerPosition < numOfPlayers ) {
            playerPositionText =
                `*¡${getNameWithAvatar( player )}, el campeonato de esta semana ha terminado!*\n` +
                `'Has quedado en posición ${playerPosition} de ${numOfPlayers} participantes.`
            animationId = 'CAACAgIAAxkBAAIBFmIw6c_nKcGT6EO7MNme-e_UxDu2AALJAQACVp29CnXYcMSIGS6NIwQ'
        }
        else {
            playerPositionText =
                `*¡${getNameWithAvatar( player )}, El campeonato de esta semana ha terminado!*\n` +
                `'Has quedado último pero no tires la toalla. ¡Pronto empieza el siguiente campeonato!.`
            animationId = 'CAACAgIAAxkBAAIBFWIw6PPwnPcOz4csXV7MtGBe3kMCAALQEgAC4LHISKl0c8gxj_boIwQ'
        }

        const finalText =
            `El campeonato ha finalizado. Estos son los resultados: \n\n` +
            `${championshipString}\n\n` +
            `${playerPositionText}\n\n` +
            `¡Te esperamos en el próximo campeonato!`
        await sendMessage( player.id, finalText, silent )
        await bot.sendAnimation( player.id, animationId, { disable_notification: silent } )
    }
}
