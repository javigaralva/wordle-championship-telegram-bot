type GameId = number
type PlayerId = number

type Player = {
    id: PlayerId,
    name: string,
    username: string
}

type ChampionshipResults = {
    [ gameId: GameId ]: {
        [ playerId: PlayerId ]: number
    }
}

type PlayerResult = {
    gameId: GameId,
    player: Player,
    attempts: number
}

type Db = {
    championshipResults: ChampionshipResults,
    players: Player[]
}