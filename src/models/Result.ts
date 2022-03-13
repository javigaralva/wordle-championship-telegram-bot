import { model, Schema } from 'mongoose'

interface IPlayerResult {
    gameId: number,
    playerId: number,
    attempts: number
}

const PlayerResultSchema = new Schema( {
    gameId: {
        type: Number,
        required: true,
    },
    playerId: {
        type: Number,
        required: true,
    },
    attempts: {
        type: Number,
        required: true,
    },
} )

const PlayerResultModel = model<IPlayerResult>( 'PlayerResult', PlayerResultSchema )

export { PlayerResultModel, IPlayerResult }
