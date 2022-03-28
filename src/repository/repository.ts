import { IPlayer, PlayerModel } from '../models/Player'
import { IPlayerResult, PlayerResultModel } from '../models/Result'
import { IWord, WordModel } from '../models/Word'

export async function getPlayers() {
    return await PlayerModel.find()
}

export async function getPlayerResults() {
    return await PlayerResultModel.find()
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
        return await PlayerModel.create( player )
    }
    else {
        playerInDb.name = player.name
        playerInDb.username = player.username
        return await playerInDb.save()
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

export async function findPlayersIn( playersId: number[] ) {
    return await PlayerModel.find( { id: { $in: playersId } } )
}

export async function findPlayersResultsIn( gameIdsRange: [ number, number ] ): Promise<IPlayerResult[]> {
    return await PlayerResultModel.find( {
        gameId: {
            $gte: gameIdsRange[ 0 ],
            $lte: gameIdsRange[ 1 ]
        }
    } )
}

export async function findPlayerResultsByGameId( gameId: number ) {
    return await PlayerResultModel.find( { gameId: gameId } )
}

export async function findPlayerResultsByPlayerIdInRange( playerId: number, gameIdsRange: [ number, number ] ) {
    return await PlayerResultModel.find( {
        playerId,
        gameId: {
            $gte: gameIdsRange[ 0 ],
            $lte: gameIdsRange[ 1 ],
        }
    } )
}

export async function createOrUpdateWord( word: IWord ) {
    let wordInDb = await WordModel.findOne( { gameId: word.gameId } )
    if( !wordInDb ) {
        return await WordModel.create( word )
    }
    else {
        wordInDb.word = word.word
        await wordInDb.save()
    }
}

export async function findWordByGameId( gameId: number ) {
    return await WordModel.findOne( { gameId } )
}

export async function findWordsInRange( gameIdsRange: [ number, number ] ) {
    return await WordModel.find( {
        gameId: {
            $gte: gameIdsRange[ 0 ],
            $lte: gameIdsRange[ 1 ],
        }
    } )
}