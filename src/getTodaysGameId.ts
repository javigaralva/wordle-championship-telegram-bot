const WORDLE_START_DATE = new Date( '2022-01-06T06:00:00.000Z' )

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