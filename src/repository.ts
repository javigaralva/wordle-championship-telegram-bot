import { IPlayer, PlayerModel } from './models/Player'
import { IPlayerResult, PlayerResultModel } from './models/Result'

export async function getPlayers() {
    return await PlayerModel.find()
}

export async function getPlayer( id: number ) {
    return await PlayerModel.findOne( { id } )
}

export async function setPlayerResult( playerResult: IPlayerResult ) {
    await createOrUpdatePlayerResult( playerResult )
}


export async function createOrUpdatePlayer( player: IPlayer ) {
    let playerInDb = await getPlayer( player.id )
    if( !playerInDb ) {
        await PlayerModel.create( player )
    }
    else {
        playerInDb.name = player.name
        playerInDb.username = player.username
        await playerInDb.save()
    }
}

async function createOrUpdatePlayerResult( playerResult: IPlayerResult ) {
    const { gameId, playerId, attempts } = playerResult
    let playerResultInDb = await PlayerResultModel.findOne( { gameId, playerId } )
    if( !playerResultInDb ) {
        await PlayerResultModel.create( playerResult )
    }
    else {
        playerResultInDb.attempts = attempts
        await playerResultInDb.save()
    }
}