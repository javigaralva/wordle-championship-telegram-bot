import base58 from 'bs58'

export function intersection( array1: any[], array2: any[] ) {
    return array1.filter( item => array2.includes( item ) )
}

export function difference( array1: any[], array2: any[] ) {
    return array1.filter( item => !array2.includes( item ) )
}

export function getRandomAvatar() {
    const animalEmojis = [ '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐸', '🐵', '🙈', '🙉', '🙊', '🐧', '🐦', '🐤', '🐴', '🦄', '🐝', '🐛', '🦋', '🐞', '🪲', '🐢', '🐍', '🦖', '🦕', '🐙', '🦀', '🐡', '🐠', '🐟', '🐳' ]
    return animalEmojis[ Math.floor( Math.random() * animalEmojis.length ) ]
}

export function sleep( ms: number ) {
    return new Promise( resolve => setTimeout( resolve, ms ) )
}

export function markdownEscape( text: string ) {
    return text.replace( /([*[])/g, '\\$1' )
}

export function encodeText( text: string ) {
    return base58.encode( Buffer.from( text ) )
}

export function decodeText( encodedText: string ) {
    try {
        return Buffer.from( base58.decode( encodedText ) ).toString()
    }
    catch( e ) {}
}

export function memoizeAsync<T extends ( ...args: any[] ) => Promise<any>>( fn: T ) {
    const cache: { [ key: string ]: any } = {}
    return async function( ...args: Parameters<T> ) {
        const key = JSON.stringify( args )
        if( cache[ key ] ) return cache[ key ]
        const result = await fn( ...args )
        cache[ key ] = result
        return result
    }
}

const ACCENTS_MAP:  { [ key: string ]: string } = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'ü': 'u',
    'Á': 'A',
    'É': 'E',
    'Í': 'I',
    'Ó': 'O',
    'Ú': 'U',
    'Ü': 'U',
}
export function removeAccents(str: string) {
    return str
        .normalize('NFD')
        .replace(/[áéíóúüÁÉÍÓÚÜ]/g, match => ACCENTS_MAP[match] ?? match )
}