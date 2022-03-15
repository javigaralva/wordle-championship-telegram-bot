export function intersection( array1: any[], array2: any[] ) {
    return array1.filter( item => array2.includes( item ) )
}

export function difference( array1: any[], array2: any[] ) {
    return array1.filter( item => !array2.includes( item ) )
}

export function getRandomAvatar() {
    const animalEmojis = [ "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🐥", "🐴", "🦄", "🐝", "🐛", "🦋", "🐞", "🪲", "🐢", "🐍", "🦖", "🦕", "🐙", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳" ]
    return animalEmojis[ Math.floor( Math.random() * animalEmojis.length ) ]
}

export function getDayOfTheWeek( date: Date = new Date() ) {
    const day = date.getUTCDay()
    return day === 0 ? 6 : day - 1
}

export function sleep( ms: number ) {
    return new Promise( resolve => setTimeout( resolve, ms ) )
}