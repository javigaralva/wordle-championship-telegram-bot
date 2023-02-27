import he from 'he'
import { markdownEscape, memoizeAsync } from '../utils'
import { RAE } from 'rae-api'

const BULLETS_ICONS = [ '🟢', '🔵', '🟣', '🔴', '🟠', '🟡' ]
const DEFINITION_ICONS = [ '📘', '📙', '📗', '📕' ]

export const getRaeDefinitions = memoizeAsync( async function( word: string ) {

    if( !word ) return

    try {
        const rae = new RAE()
        const search = await rae.searchWord( word )
        if (!search.isOk()) return

        const hasWords = search.getRes().length > 0
        const areWordsRelated = search.getApprox()

        if (!hasWords) return

        let text = areWordsRelated && hasWords
            ? `⚠ Aviso: La palabra *${word}* no está en el Diccionario. Las entradas que se muestran a continuación podrían estar relacionadas.\n\n`
            : ''

        const allWordDefinitions = await Promise.all(search.getRes().map(res => rae.fetchWord(res.getId())))

        text += he.decode(allWordDefinitions
            .map((wordDefinition, i) => {
                const wordRes = search.getRes().at(i)
                const wordHeader = wordRes?.getHeader() ?? word
                const definitions = wordDefinition.getDefinitions()
                return [
                    `👉 ${DEFINITION_ICONS[i % DEFINITION_ICONS.length]} *${markdownEscape(wordHeader)}*`,
                    ...definitions.map((def, i) =>
                        `  ${BULLETS_ICONS[i % BULLETS_ICONS.length]}  ${markdownEscape(def.getDefinition())}`
                    ),
                    ''
                ]
            })
            .flat()
            .join('\n')
        )

        return text
    }
    catch (error) {
        return console.error( `Error searching in rae for word ${word}: `, error )
    }
} )