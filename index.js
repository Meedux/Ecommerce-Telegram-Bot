import { menu } from './inline/Menu.js';
import { changeInlineKeyboard } from './lib/util.js';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot('6634328786:AAEMGMUIR-6zqIks4MXVGiie0nYT8SNfs9Q', { polling: true });

// Buttons 
const greet = {
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
};

// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const response = "Welcome to the Commerce Bot! Would you like to Shop?";
    bot.sendMessage(chatId, response, greet);
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
            // Do not remove the inline keyboard here
            break;
        case 'categories':
            changeInlineKeyboard("You have chosen Categories, Fetching Categories Data...", bot, menu.reply_markup, chatId, query)
            break;
        case 'cart':
            changeInlineKeyboard("give me a sec and let me check your Cart...", bot, menu.reply_markup, chatId, query)
            break;
        case 'history':
            changeInlineKeyboard("Fetching History Data...", bot, menu.reply_markup, chatId, query)
            break;
    }
});
