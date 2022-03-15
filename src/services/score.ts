const SCORE_BY_ATTEMPTS = [ 0, 21, 13, 8, 5, 3, 2 ]

export function getScore( attempts: number ): number {
    return SCORE_BY_ATTEMPTS[ attempts ] || 0
}
