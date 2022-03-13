type ParsedResult = {
    gameId: number,
    attempts: number,
    isValid: boolean
}

export function parseForwardResult( forwardedResult: string ): ParsedResult | undefined {
    const match = /#(\d+) (\d|X)\/6/gm.exec( forwardedResult )
    if( !match ) return

    const [ , round, attempts ] = match
    const parsedAttempts = getNumberOfAttempts( forwardedResult )
    const isValid = ( attempts === 'X' ? 6 : parseInt( attempts ) ) === parsedAttempts
    return {
        gameId: parseInt( round ),
        attempts: attempts === 'X' ? 0 : parseInt( attempts ),
        isValid: isValid
    }
}

function getNumberOfAttempts( forwardedResult: string ): number {
    return forwardedResult
        .split( '\n' )
        .filter( o => !o.includes( "ordle" ) )
        .filter( Boolean )
        .length
}