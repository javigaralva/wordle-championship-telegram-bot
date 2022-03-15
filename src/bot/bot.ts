import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from '../config/config';

if( !TELEGRAM_BOT_TOKEN ) {
    console.error( '\n\nTELEGRAM_BOT_TOKEN is not set\n\n' )
    process.exit( 1 )
}

export const bot = new TelegramBot( TELEGRAM_BOT_TOKEN, { polling: true } );
