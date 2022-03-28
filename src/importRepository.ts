import 'dotenv/config'
import './lib/db'

import { createOrUpdatePlayer, setPlayerResult, getPlayerResults, getPlayers } from './repository/repository'
import fs from 'fs/promises'
import { IPlayer } from './models/Player'
import { IPlayerResult } from './models/Result'

type DbSchema = {
    players: IPlayer[]
    championshipResults: IPlayerResult[]
}

( async () => {
    const date = '' // Enter date here
    if( !date ) return console.error( '❌ No date provided' )

    const dbFileName = `./DB_backup/data_${date}.json`

    const content: DbSchema = JSON.parse( await fs.readFile( dbFileName, 'utf8' ) )

    for( const player of content.players ) {
        await createOrUpdatePlayer( player )
    }

    for( const playerResult of content.championshipResults ) {
        await setPlayerResult( playerResult )
    }

    console.log( '✅ DB backup restored' )

} )()
