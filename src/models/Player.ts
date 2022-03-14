import { model, Schema } from 'mongoose'

interface IPlayer {
    id: number,
    name: string,
    username: string,
    avatar?: string,
}

const PlayerSchema = new Schema( {
    id: {
        type: Number,
        unique: true,
        required: true,
    },
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    avatar: {
        type: String,
    },
} )

const PlayerModel = model<IPlayer>( 'Player', PlayerSchema )

export { PlayerModel, IPlayer }
