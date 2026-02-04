import { IPlayerResult } from '../models/Result'
import { IWord } from '../models/Word'
import * as Repository from '../repository/repository'
import { ALL_PLAYERS_IDS } from '../config/config'
import { removeAccents } from '../utils'

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

export async function findAuthorizedPlayerByIdentifier( identifier: string ) {
    const authorizedPlayers = await Repository.findPlayersIn( ALL_PLAYERS_IDS )
    const normalizedIdentifier = removeAccents( identifier.toLowerCase().trim() )

    // 1. Try exact ID match
    const idMatch = authorizedPlayers.find( p => p.id.toString() === identifier.trim() )
    if ( idMatch ) return idMatch

    // 2. Try fuzzy match in name, avatar, or username
    const matches = authorizedPlayers.filter( p => {
        const normalizedName = removeAccents( ( p.name ?? '' ).toLowerCase() )
        const normalizedAvatar = removeAccents( ( p.avatar ?? '' ).toLowerCase() )
        const normalizedUsername = removeAccents( ( p.username ?? '' ).toLowerCase() )

        return normalizedName.includes( normalizedIdentifier ) || 
               normalizedAvatar.includes( normalizedIdentifier ) ||
               normalizedUsername.includes( normalizedIdentifier )
    } )

    if ( matches.length === 1 ) return matches[ 0 ]
    
    // If multiple matches, try to find an exact one (normalized)
    const exactMatch = matches.find( p => 
        removeAccents( ( p.name ?? '' ).toLowerCase() ) === normalizedIdentifier || 
        removeAccents( ( p.avatar ?? '' ).toLowerCase() ) === normalizedIdentifier ||
        removeAccents( ( p.username ?? '' ).toLowerCase() ) === normalizedIdentifier
    )

    return exactMatch ?? matches[ 0 ] // Return best match or first if multiple
}
