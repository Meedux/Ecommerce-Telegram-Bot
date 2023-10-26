import TelegramBot from 'node-telegram-bot-api';
import { configDotenv } from 'dotenv';

configDotenv();
export const bot = new TelegramBot(process.env.TELEGRAMKEY, { polling: true });
