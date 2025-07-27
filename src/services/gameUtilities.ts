import { WORDLE_TYPE } from '../config/config'
import { IPlayer } from '../models/Player'

export const WORDLE_START_DATE = {
    NORMAL  : new Date( '2022-01-06T04:00:00.000Z' ),
    ACCENT  : new Date( '2022-02-28T04:00:00.000Z' ),
    SCIENCE : new Date( '2022-03-13T04:00:00.000Z' ),
}[ WORDLE_TYPE ]

export function getTodaysGameId() {
    return getGameIdFromDate()
}

export function getGameIdFromDate( date: Date = new Date() ) {
    const start = WORDLE_START_DATE
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor( diff / oneDay )
}

export function getDateFromGameId( gameId: number ) {
    const start = WORDLE_START_DATE
    const oneDay = 1000 * 60 * 60 * 24
    return new Date( start.getTime() + gameId * oneDay )
}

export function getDayOfTheWeek( date: Date = new Date() ) {
    const msOffset = ( WORDLE_START_DATE.getUTCHours() * 60 * 60 + WORDLE_START_DATE.getUTCMinutes() * 60 + WORDLE_START_DATE.getUTCSeconds() ) * 1000
    const normalizedDate = new Date( date.getTime() - msOffset )
    const day = normalizedDate.getUTCDay()
    return day === 0 ? 6 : day - 1
}

export function getDayOfTheWeekFromGameId( gameId: number ) {
    const date = getDateFromGameId( gameId )
    const day = date.getDay()
    if( day === 0 ) return 'Domingo'
    if( day === 1 ) return 'Lunes'
    if( day === 2 ) return 'Martes'
    if( day === 3 ) return 'Miércoles'
    if( day === 4 ) return 'Jueves'
    if( day === 5 ) return 'Viernes'
    if( day === 6 ) return 'Sábado'
}

export function getEmojiOfDayOfTheWeekFromGameId( gameId: number ) {
    const date = getDateFromGameId( gameId )
    const day = date.getDay()
    if( day === 0 ) return '7️⃣'
    if( day === 1 ) return '1️⃣'
    if( day === 2 ) return '2️⃣'
    if( day === 3 ) return '3️⃣'
    if( day === 4 ) return '4️⃣'
    if( day === 5 ) return '5️⃣'
    if( day === 6 ) return '6️⃣'
}

export function getNextGameStartDate() {
    return getDateFromGameId( getGameIdFromDate() + 1 )
}

export function getNameWithAvatar( player: IPlayer ) {
    return `${player.avatar ? `${player.avatar} ` : ''}${player.name}`
}

export function attemptsToString( attempts: number ) {
    return attempts === 0 ? 'X' : attempts
}

const ICONS_BY_POSITION = [ , '🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟' ]
export function getIconByPosition( index: number ) {
    return ICONS_BY_POSITION[ index ] ?? `  ${index}. `
}


const WORDLE_BASE_URL = 'https://lapalabradeldia.com'

const WORDLE_ARCHIVE_SEGMENT_URL = {
    NORMAL  : 'normal',
    ACCENT  : 'tildes',
    SCIENCE : 'ciencia',
}[ WORDLE_TYPE ]

const WORDLE_CURRENT_PLAY_SEGMENT_URL = {
    NORMAL  : '',
    ACCENT  : 'tildes',
    SCIENCE : 'ciencia',
}[ WORDLE_TYPE ]

export function getGameUrl( gameId: number ) {
    const todaysGameId = getTodaysGameId()
    return todaysGameId === gameId 
        ? `${WORDLE_BASE_URL}/${WORDLE_CURRENT_PLAY_SEGMENT_URL}`
        : `${WORDLE_BASE_URL}/archivo/${WORDLE_ARCHIVE_SEGMENT_URL}/${gameId}/`
}
