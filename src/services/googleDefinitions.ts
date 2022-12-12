import { markdownEscape, memoizeAsync } from '../utils'

const google = require( 'googlethis' )

export const getGoogleDefinitionsAndExamplesFor = memoizeAsync( async function ( word: string ) {
    if( !word ) return

    try {
        const response = await google.search( `${word} definición`, {
            page: 0,
            safe: false,
            additional_params: {
                hl: 'es'
            }
        } )

        const definitions = ( response?.dictionary?.definitions ?? [] )
            .map( ( definition: string, i: number ) => `   ${i % 2 ? '🔶' : '🔷'} ${markdownEscape( definition )}` )
            .flat()
            .join( '\n' )

        const examples = ( response?.dictionary?.examples ?? [] )
            .map( ( example: string, i: number ) => `   🗣 ${markdownEscape( example )}` )
            .flat()
            .join( '\n' )

        const wordUpperCase = word.toUpperCase()
        const text = [
            definitions && `✍️ Definición de *${wordUpperCase}*`,
            definitions,
            definitions && ' ',
            examples && `💬 Ejemplos de *${wordUpperCase}*`,
            examples
        ].filter( Boolean ).join( '\n' )
        return text
    }
    catch (error) {
        return console.error( `Error searching in google for word ${word}: `, error )
    }
} )
