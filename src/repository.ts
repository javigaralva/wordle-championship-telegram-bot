import fs from 'fs/promises'
import path from 'path'

const RESULTS_FILE = path.join( __dirname, 'db.json' ).normalize()

let db: Db

export async function loadDB(): Promise<void>  {
    try {
        const result = await fs.readFile( RESULTS_FILE, 'utf8' )
        db = JSON.parse( result )
    } catch( e ) {
        db = {
            championshipResults: {},
            players: []
        }
    }
}

async function saveDB() {
    await fs.writeFile( RESULTS_FILE, JSON.stringify( db, null, 2 ) )
}

export function getChampionshipResults() {
    return db.championshipResults
}

export function getPlayers() {
    return db.players
}

export function getPlayer( id: PlayerId ) {
    return db.players.find( player => player.id === id )
}

export async function setPlayerResult( playerResult: PlayerResult ) {
    createOrUpdatePlayer( playerResult )
    createOrUpdatePlayerResult( playerResult )
    await saveDB()
}

export async function resetChampionshipResults() {
    db.championshipResults = {}
    saveDB()
}


function createOrUpdatePlayer( playerResult: PlayerResult ) {
    const player = getPlayer( playerResult.player.id )

    if( !player ) {
        return db.players.push( playerResult.player )
    }

    player.name = playerResult.player.name
    player.username = playerResult.player.username
}

function createOrUpdatePlayerResult( playerResult: PlayerResult ) {
    db.championshipResults[ playerResult.gameId ] = db.championshipResults[ playerResult.gameId ] || {}
    db.championshipResults[ playerResult.gameId ][ playerResult.player.id ] = playerResult.attempts
}