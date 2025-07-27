import { getDateFromGameId, getNameWithAvatar } from './gameUtilities'
import { ChampionshipData, getChampionshipData, getChampionshipDataForPlayerId, haveAllPlayersPlayedThis } from './championship'
import { bot } from '../bot/bot'
import { sendMessage } from '../bot/sendMessage'
import { findWordByGameId } from '../repository/repository'
import { getGoogleDefinitionsAndExamplesFor } from './googleDefinitions'

export async function sendChampionshipReportTo( todaysGameId: number, playerId: number, silent = false ) {
    const { championshipString } = await getChampionshipDataForPlayerId({ playerId })

    const championshipStringToSend = await haveAllPlayersPlayedThis( todaysGameId )
        ? championshipString
        : championshipString.replace( 'RANKING', 'RANKING (provisional)' )

    await sendMessage( playerId, championshipStringToSend, silent )
}

export async function sendReport( todaysGameId: number, silent = false ) {
    const isSunday = getDateFromGameId( todaysGameId ).getDay() === 0
    isSunday
        ? await sendEndOfChampionshipMessage( silent )
        : await sendDailyReport( silent )
}

export async function sendDailyReport( silent = false ) {
    const { championshipPlayers } = await getChampionshipData()
    for( const player of championshipPlayers ) {
        const { championshipString } = await getChampionshipDataForPlayerId({ playerId: player.id })
        await sendMessage( player.id, championshipString, silent )
    }
}

export async function sendDefinitionsAndExamples( todaysGameId: number, silent = false, championshipData?: ChampionshipData ) {
    championshipData ??= await getChampionshipData()
    const { championshipPlayers } = championshipData
    const todaysWord = await findWordByGameId( todaysGameId )
    if( !todaysWord ) return console.warn( `No word found for gameId ${todaysGameId}` )

    const text = await getGoogleDefinitionsAndExamplesFor( todaysWord.word )
    if( !text ) return console.warn( `No definitions found for word ${todaysWord.word}` )

    for( const player of championshipPlayers ) {
        await sendMessage( player.id, text, silent )
    }
}

const END_OF_CHAMPIONSHIP_STICKERS = {
    POSITION_1: [
        'CAACAgIAAxkBAANoYi-Sa0NMq_8VR2XliI-cIUBp-DUAAkoCAAJWnb0KyWrGaGAYevAjBA',
        'CAACAgIAAxkBAAOJYydBnN0S2hsmF7ld2Znx1IHsZXQAAkgAA8GcYAwQMg-i1VmYsykE',
        'CAACAgIAAxkBAAOMYydBxdVrvQR5bnJdClsDKMMmQQYAAvgHAAKMLf0H58Me6gFY8d4pBA',
        'CAACAgIAAxkBAAOPYydB4dM1EVSPa_Gaaa-JfhDjRwcAAiYAA1m7_CViffG8afMgMykE',
        'CAACAgIAAxkBAAEYMUljJ0Jfhdems0HTGjfDgSV108TPeQACHQADr8ZRGlyO-uEKz2-8KQQ',
        'CAACAgEAAxkBAAEYMU1jJ0Kj6YFRZQ9DNOZa49GmdNxfuAACOgEAAlPMkEfITpc2CBnS8SkE',
        'CAACAgIAAxkBAAEYMVFjJ0K77ygIQCFlmp9CL7ewUcxwUQACJwAD9wLID0vZJXq0bnAbKQQ',
        'CAACAgIAAxkBAAIBFGMnRhzvn7pSejrad5ibMhAnUlMxAAJ_AAM7YCQUIV2btD-56NwpBA'
    ],
    POSITION_2: [
        'CAACAgIAAxkBAAIBE2Iw5xV3u8TFI7Vc2yn09RIR0aTgAAKLBwACjC39B7OqoghZQedEIwQ',
        'CAACAgIAAxkBAAEYMVdjJ0LiklchVY3kaTFPsMRa2Nu-mAACVRUAAsKgoEsoQtSGCVeCtikE',
        'CAACAgIAAxkBAAOuYydDmNHbeUDjZrJDLWgAAc5-Jis-AALwEgAC7LmYS8gRf6it9xz9KQQ',
        'CAACAgIAAxkBAAP_YydFl3PI5IkItQ_1OZqGrBFmK_AAAmsAA0G1Vgz685tG-317lSkE'
    ],
    POSITION_3: [
        'CAACAgIAAxkBAAIBFGIw6FBtjqYPJbBZ3v2mhDAJyv6oAAL-AANWnb0K2gRhMC751_8jBA',
        'CAACAgIAAxkBAAO4YydDyG6kwApvn_RBICB3ZbxH3hcAAhQUAAI2VSlLdq42h2TqfScpBA',
        'CAACAgIAAxkBAAPGYydESFX7XIO-a_6BKqDemHFXwOgAAtQUAAJvuchI-w5vzad-chApBA',
        'CAACAgIAAxkBAAPhYydE5qM5RxbVGYw-2B2IIY5Op_EAAucNAAJMAAGpSyj0m4RdXE2JKQQ',
        'CAACAgIAAxkBAAPyYydFZXb7Wizxmbzqa4Cnp9s2DnEAAo4AA0G1VgyBnjHhtW9XcCkE',
        'CAACAgIAAxkBAAP8YydFh5j7ec9OAzG442qEfvMf1awAApoAA0G1VgyYh20HPlo8kikE'
    ],
    POSITION_IN_THE_MIDDLE: [
        'CAACAgIAAxkBAAIBFmIw6c_nKcGT6EO7MNme-e_UxDu2AALJAQACVp29CnXYcMSIGS6NIwQ',
        'CAACAgEAAxkBAAEYMUtjJ0KHgmtEawHtCJR71ZyFrpC_hQACtgEAAjFveUT34YvZ0Se6mSkE',
        'CAACAgIAAxkBAAOxYydDsptn8RxxM8EmXZ3hoUyVVUgAAmITAAKmMKBLaZ3KKhv_npUpBA',
        'CAACAgIAAxkBAAPQYydEizk7J7fRiP0Z_HQiW0HiU60AAloQAAJYVgFJ44PhxRF4hfkpBA',
        'CAACAgIAAxkBAAPrYydFJ7sBGYXRT1pjJfkgi4s1f_sAApUAAztgJBTnHsL_Us16ZikE',
        'CAACAgIAAxkBAAP1YydFeCiPoAABK_n_o7Cbpfini53eAAJ9AANBtVYMwjui2rLgJYApBA',
        'CAACAgIAAxkBAAIBBmMnRbpEA66qmYp-_cQV9h4nEfSSAAJxAANBtVYMWKAQRNq7F78pBA',
        'CAACAgIAAxkBAAIBDWMnReEFD4ZKRESHwglURPc-8qWqAAKAAAPBnGAMNSI9fXm2854pBA',
        'CAACAgIAAxkBAAIBG2MnRm4FFDSfvluzbczX7yyyTYIWAAIyAgACygMGC58rgetxGJt7KQQ',
        'CAACAgIAAxkBAAIBImMnRxIQFC1EFl8TRxZ6miAcAAFEWAACSwIAAsoDBguD1xE8QtLPIykE'
    ],
    POSITION_LAST: [
        'CAACAgIAAxkBAAIBFWIw6PPwnPcOz4csXV7MtGBe3kMCAALQEgAC4LHISKl0c8gxj_boIwQ',
        'CAACAgIAAxkBAAOaYydDHYSohDF3IunTKz0S9T_ghMEAAqsQAAJ1YaFLfWQVHycnhbQpBA',
        'CAACAgIAAxkBAAOhYydDKeapB8a_5BWB4gdeb_dObTgAAkARAAJWP_FLJJ5nYdPj5RopBA',
        'CAACAgIAAxkBAAOkYydDWmbUW33z47aORs9UtaeajQgAAtMVAAJXs1lLDcAKaKEC29MpBA',
        'CAACAgIAAxkBAAOrYydDiJxxQwHi4Tu7wofpX7q4Y58AAh8XAAIWqpFLHTo6pf9pxbkpBA',
        'CAACAgIAAxkBAAO_YydECesMWjJE2zWk7gABpJAKew6eAALqDwACvDyoSystXpnSqmanKQQ',
        'CAACAgIAAxkBAAPTYydEpM-nP2xLu0oo7orNCGQspw4AAvoRAAJJxfBLgc49t_zPMd4pBA',
        'CAACAgIAAxkBAAPaYydEzQT4Q5Ioc-ShzD1aMHyroNUAAs0PAAK5q-lKXtGKwym5t2cpBA',
        'CAACAgIAAxkBAAPoYydFFGptEWfhYU4kOh4bi74LAxgAApwAAztgJBTy6QyzGJu3PSkE'
    ]
}

function sample<T>(array: T[]) {
    return array[ Math.floor( Math.random() * array.length ) ]
}

export async function sendEndOfChampionshipMessage( silent = false, championshipData?: ChampionshipData ) {
    championshipData ??= await getChampionshipData()
    const { championshipRanking, championshipString, championshipPlayers } = championshipData

    const numOfPlayers = championshipRanking.length

    for( const player of championshipPlayers ) {
        const playerPosition = championshipRanking.findIndex( playerFinalScore => playerFinalScore.player.id === player.id ) + 1

        let animationId: string
        let playerPositionText
        if( playerPosition === 1 ) {
            playerPositionText =
                `*¡Enhorabuena, ${getNameWithAvatar( player )}!*\n` +
                `¡Has ganado el campeonato 🏆🏆🏆🏆!`
            animationId = sample( END_OF_CHAMPIONSHIP_STICKERS.POSITION_1 )
        }
        else if( playerPosition === 2 ) {
            playerPositionText =
                `*¡Muy bien, ${getNameWithAvatar( player )}!*\n` +
                `¡Has quedado en segunda posición en el campeonato!`
            animationId = sample( END_OF_CHAMPIONSHIP_STICKERS.POSITION_2 )
        }
        else if( playerPosition === 3 ) {
            playerPositionText =
                `*¡Bien jugado, ${getNameWithAvatar( player )}!*\n` +
                `¡Has quedado en tercera posición en el campeonato!`
            animationId = sample( END_OF_CHAMPIONSHIP_STICKERS.POSITION_3 )
        }
        else if( playerPosition < numOfPlayers ) {
            playerPositionText =
                `*¡${getNameWithAvatar( player )}, el campeonato de esta semana ha terminado!*\n` +
                `Has quedado en posición ${playerPosition} de ${numOfPlayers} participantes.`
            animationId = sample( END_OF_CHAMPIONSHIP_STICKERS.POSITION_IN_THE_MIDDLE )
        }
        else {
            playerPositionText =
                `*¡${getNameWithAvatar( player )}, el campeonato de esta semana ha terminado!*\n` +
                `Has quedado último pero no tires la toalla. ¡Pronto empieza el siguiente campeonato!.`
            animationId = sample( END_OF_CHAMPIONSHIP_STICKERS.POSITION_LAST )
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
