import 'dotenv/config'
import './lib/db'

import { getPlayerResults, getPlayers, getWords } from './repository/repository'
import fs from 'fs/promises'

( async () => {
    const players = await getPlayers()
    const championshipResults = await getPlayerResults()
    const words = await getWords()

    const json = JSON.stringify( { players, championshipResults, words }, null, 2 )
    const date = new Date().toISOString().split( '.' )[ 0 ].replace( /[^\d]/gi, '' )
    const dbFileName = `./DB_backup/data_${date}.json`
    await fs.writeFile( dbFileName, json, 'utf8' )
    console.log( `✅ DB backup created (${dbFileName})` )
} )()
