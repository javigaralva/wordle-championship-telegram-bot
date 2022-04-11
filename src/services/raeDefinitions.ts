import he from 'he'
import { markdownEscape, memoizeAsync } from '../utils'
const raejs = require( '@jodacame/raejs' )

const BULLETS_ICONS = [ '🟢', '🔵', '🟣', '🔴', '🟠', '🟡' ]
const DEFINITION_ICONS = [ '📘', '📙', '📗', '📕' ]

export const getRaeDefinitions = memoizeAsync( async function( word: string ) {

    if( !word ) return

    const response = await raejs.search( word )
    if( response.error ) return

    const text = he.decode( response.results.map( ( result: any, i: number ) =>
        [
            `👉 ${DEFINITION_ICONS[ i % DEFINITION_ICONS.length ]} *${markdownEscape( result.header )}* ${result.source ? `(${markdownEscape( result.source )})` : ''}`,
            ...result.definition.map( ( def: string, i: number ) =>
                `  ${BULLETS_ICONS[ i % BULLETS_ICONS.length ]}  ${markdownEscape( def )}`
            ),
            ''
        ] )
        .flat()
        .join( '\n' )
    )

    return text
} )