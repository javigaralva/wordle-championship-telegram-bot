export function intersection( array1: any[], array2: any[] ) {
    return array1.filter( item => array2.includes( item ) )
}

export function difference( array1: any[], array2: any[] ) {
    return array1.filter( item => !array2.includes( item ) )
}

export function getRandomAvatar() {
    const animalEmojis = [ "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐸", "🐵", "🙈", "🙉", "🙊", "🐧", "🐦", "🐤", "🐴", "🦄", "🐝", "🐛", "🦋", "🐞", "🪲", "🐢", "🐍", "🦖", "🦕", "🐙", "🦀", "🐡", "🐠", "🐟", "🐳" ]
    return animalEmojis[ Math.floor( Math.random() * animalEmojis.length ) ]
}

export function sleep( ms: number ) {
    return new Promise( resolve => setTimeout( resolve, ms ) )
}

export function markdownEscape( text: string ) {
    return text.replace( /([*[])/g, "\\$1" )
}    return text.replace( /([*[])/g, '\\$1' )
}

export function encodeText( text: string ) {
    return base58.encode( Buffer.from( text ) )
}

export function decodeText( encodedText: string ) {
    return Buffer.from( base58.decode( encodedText ) ).toString()
