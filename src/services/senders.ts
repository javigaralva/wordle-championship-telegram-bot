import { getDateFromGameId, getNameWithAvatar } from './gameUtilities'
import { ChampionshipData, getChampionshipData } from './championship'
import { bot } from "../bot/bot"
import { sendMessage } from "../bot/sendMessage"
import { findWordByGameId } from '../repository/repository'
import { getGoogleDefinitionsAndExamplesFor } from './googleDefinitions'
import { sleep } from '../utils'

export async function sendChampionshipReportTo( todaysGameId: number, playerId: number, silent = false ) {
    const { championshipString } = await getChampionshipData()
    await sendMessage( playerId, championshipString, silent )
}

export async function sendReport( todaysGameId: number, silent = false, championshipData?: ChampionshipData ) {
    championshipData ??= await getChampionshipData()

    await sendDefinitionsAndExamples( todaysGameId, silent, championshipData )
    await sleep( 4000 )

    const isSunday = getDateFromGameId( todaysGameId ).getDay() === 0
    isSunday
        ? await sendEndOfChampionshipMessage( silent, championshipData )
        : await sendDailyReport( silent, championshipData )
}

export async function sendDailyReport( silent = false, championshipData?: ChampionshipData ) {
    championshipData ??= await getChampionshipData()
    const { championshipString, championshipPlayers } = championshipData
    for( const player of championshipPlayers ) {
        await sendMessage( player.id, championshipString, silent )
    }
}

export async function sendDefinitionsAndExamples( todaysGameId: number, silent = false, championshipData?: ChampionshipData ) {
    championshipData ??= await getChampionshipData()
    const { championshipPlayers } = championshipData
    const todaysWord = await findWordByGameId( todaysGameId )
    if( !todaysWord ) return

    const text = await getGoogleDefinitionsAndExamplesFor( todaysWord.word )
    if( !text ) return

    for( const player of championshipPlayers ) {
        await sendMessage( player.id, text, silent )
    }
}

export async function sendEndOfChampionshipMessage( silent = false, championshipData?: ChampionshipData ) {
    championshipData ??= await getChampionshipData()
    const { championshipRanking, championshipString, championshipPlayers } = championshipData

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
                `Has quedado en posición ${playerPosition} de ${numOfPlayers} participantes.`
            animationId = 'CAACAgIAAxkBAAIBFmIw6c_nKcGT6EO7MNme-e_UxDu2AALJAQACVp29CnXYcMSIGS6NIwQ'
        }
        else {
            playerPositionText =
                `*¡${getNameWithAvatar( player )}, el campeonato de esta semana ha terminado!*\n` +
                `Has quedado último pero no tires la toalla. ¡Pronto empieza el siguiente campeonato!.`
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
