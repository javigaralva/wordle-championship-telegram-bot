export function getTodaysGameId() {
    return getGameIdFromDate()
}

export function getGameIdFromDate( date: Date = new Date() ) {
    const start = new Date( '2022-01-06T06:00:00.000Z' )
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor( diff / oneDay )
}