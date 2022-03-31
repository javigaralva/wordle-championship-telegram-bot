import he from 'he'
const raejs = require( '@jodacame/raejs' )

const BULLETS_ICONS = [ '🟢', '🔵', '🟣', '🔴', '🟠', '🟡' ]

export async function getRaeDefinitions( word: string ) {

    if( !word ) return

    const response = await raejs.search( word )
    if( response.error ) return

    const text = he.decode( response.results.map( ( result: any, i: number ) =>
        [
            `👉 *${result.header}* ${result.source ? `(${result.source})` : ''}`,
            ...result.definition.map( ( def: string, i: number ) =>
                `  ${BULLETS_ICONS[ i % BULLETS_ICONS.length ]}  ${def}`
            ),
            ''
        ] )
        .flat()
        .join( '\n' )
    )

    return text
}