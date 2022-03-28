import { model, Schema } from 'mongoose'

interface IWord {
    gameId: number,
    word: string
}

const WordSchema = new Schema( {
    gameId: {
        type: Number,
        unique: true,
        required: true,
    },
    word: {
        type: String,
        required: true,
    },
} )

const WordModel = model<IWord>( 'Word', WordSchema )

export { WordModel, IWord }
