import { IPlayerResult } from '../models/Result'
import { IWord } from '../models/Word'
import * as Repository from '../repository/repository'

export function addWord( word: IWord ) {
    return Repository.createOrUpdateWord( word )
}

export function getPlayers() {
    return Repository.getPlayers()
}

type PlayerResultRemoveParams = Pick<IPlayerResult, 'gameId' | 'playerId'>
export function removePlayerResult(playerResultRemoveParams: PlayerResultRemoveParams) {
    return Repository.removePlayerResult(playerResultRemoveParams)
}

export function getPlayer(id: number) {
    return Repository.getPlayer(id)
}