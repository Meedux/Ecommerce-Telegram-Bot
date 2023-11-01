import { menu } from './inline/Menu.js';
import { changeInlineKeyboard } from './lib/util.js';
import { sendCartContents } from './inline/Cart.js';
import { sendCatMenu } from './inline/Categories.js';
import { Sequelize } from 'sequelize';
import TelegramBot from 'node-telegram-bot-api';
import { configDotenv } from 'dotenv';

configDotenv();
export const bot = new TelegramBot(process.env.TELEGRAMKEY, { polling: true });

(async () => {

    const sql = new Sequelize('juandb', 'root', 'root', {
        host: 'localhost',
        dialect: 'mysql'
    })
    
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
    
        const response = `Welcome to the Commerce Bot! Would you like to Shop?`;
        bot.sendMessage(chatId, response, {
            reply_markup:{
                inline_keyboard: [
                    [
                        {
                            text: "Yes",
                            callback_data: "Yes"
                        },
                        {
                            text: "No",
                            callback_data: "No"
                        }
                    ]
                ]
            }
        });
    });
    
    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        const buttonClicked = query.data;
    
        switch (buttonClicked) {
            case 'Yes':
                console.log("Menu");
                changeInlineKeyboard("Here is our Menu!", bot, menu.reply_markup, chatId, query)
                break;
            case 'No':
            case 'exit':
                bot.editMessageText("Bot is now Closing. Thank you for Shopping with us :).", {
                    chat_id: chatId,
                    message_id: query.message.message_id
                });
                break;
            case 'categories':
                sendCatMenu(chatId, bot, query)
                break;
            case 'cart':
                sendCartContents(chatId, bot, query)
                break;
            case 'history':
                changeInlineKeyboard("Fetching History Data...", bot, menu.reply_markup, chatId, query)
                break;
        }
    });
})()


