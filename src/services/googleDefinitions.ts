const google = require( 'googlethis' )

export async function getGoogleDefinitionsAndExamplesFor( word: string ) {
    if( !word ) return

    const response = await google.search( `${word} definición`, {
        page: 0,
        safe: false,
        additional_params: {
            hl: 'es'
        }
    } )

    const definitions = ( response?.dictionary?.definitions ?? [] )
        .map( ( definition: string, i: number ) => `   ${i % 2 ? '🔶' : '🔷'} ${definition}` )
        .flat()
        .join( '\n' )

    const examples = ( response?.dictionary?.examples ?? [] )
        .map( ( example: string, i: number ) => `   🗣 ${example}` )
        .flat()
        .join( '\n' )

    const wordUpperCase = word.toUpperCase()
    const text = [
        definitions && `📚 Definición de *${wordUpperCase}*`,
        definitions,
        definitions && ' ',
        examples && `📚 Ejemplos de *${wordUpperCase}*`,
        examples
    ].filter( Boolean ).join( '\n' )

    return text.replace( /\[/g, '\\[' )
}
