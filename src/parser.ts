type ParsedResult = {
    gameId: GameId,
    attempts: number
}

export function parseForwardResult( forwardedResult: string ): ParsedResult | undefined {
    const match = /#(\d+) (\d|X)\/6/gm.exec( forwardedResult )
    if( !match ) return

    const [ , round, attempts ] = match
    return {
        gameId: parseInt( round ),
        attempts: attempts === 'X' ? 0 : parseInt( attempts )
    }
}
