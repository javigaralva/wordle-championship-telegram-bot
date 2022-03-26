import 'dotenv/config'
import './lib/db'

import { getPlayerResults, getPlayers } from './repository/repository'
import fs from 'fs/promises'

( async () => {
    const players = await getPlayers()
    const championshipResults = await getPlayerResults()

    const json = JSON.stringify( { players, championshipResults }, null, 2 )
    const date = new Date().toISOString().split( '.' )[ 0 ].replace( /[^\d]/gi, '' )
    await fs.writeFile( `./data_${date}.json`, json )
} )()
