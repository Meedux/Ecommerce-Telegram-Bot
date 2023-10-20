const TelegramBot = require('node-telegram-bot-api');
const cheerio = require('cheerio');

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

const menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Categories",
                    callback_data: "categories"
                },
                {
                    text: "Cart",
                    callback_data: "cart"
                }
            ],
            [  
            ],
            [
                {
                    text: "History",
                    callback_data: "history"
                },
                {
                    text: "Register",
                    callback_data: "register"
                }
            ],
            [   
            ],
            [
                {
                    text: "Login",
                    callback_data: "login"
                },
                {
                    text: "Exit",
                    callback_data: "exit"
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
            bot.editMessageText("Here is our Menu!", {
                chat_id: chatId,
                message_id: query.message.message_id,
                reply_markup: menu.reply_markup
            });
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
            try{
                bot.editMessageText("You have chosen Categories, Fetching Categories Data...", {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: menu.reply_markup
                });
            }catch(error){
                console.log(error)
            }
            // Do not remove the inline keyboard here
            break;
        case 'cart':
            try{
            bot.editMessageText("Wow, give me a sec and let me check your Cart", {
                chat_id: chatId,
                message_id: query.message.message_id,
                reply_markup: menu.reply_markup
            })}catch(error){
                console.log(error)
            }
            // Do not remove the inline keyboard here
            break;
        case 'history':
            try{
            bot.editMessageText("Fetching History Data...", {
                chat_id: chatId,
                message_id: query.message.message_id,
                reply_markup: menu.reply_markup
            })}catch(error){
                console.log(error)
            }
            // Do not remove the inline keyboard here
            break;
        case 'login':
            try{
            bot.editMessageText("Logging In...", {
                chat_id: chatId,
                message_id: query.message.message_id,
                reply_markup: menu.reply_markup
            })}catch(error){
                console.log(error)
            }
            // Do not remove the inline keyboard here
            break;
        case 'register':
            try{
            bot.editMessageText("Registering...", {
                chat_id: chatId,
                message_id: query.message.message_id,
                reply_markup: menu.reply_markup
            })}catch(error){
                console.log(error)
            }
            // Do not remove the inline keyboard here
            break;
    }
});
