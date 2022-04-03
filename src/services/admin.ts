import { IWord } from '../models/Word'
import { createOrUpdateWord } from '../repository/repository'

export function addWord( word: IWord ) {
    return createOrUpdateWord( word )
}