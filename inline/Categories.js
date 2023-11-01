import { menu } from "./Menu.js";
import { changeInlineKeyboard } from "../lib/util.js";
import { sendProductMessages } from "./Products.js";


export const sendCatMenu = (chatId, bot, query) => {
    const categories = [
        "Category 1",
        "Category 2",
        "Category 3",
        "Category 4",
        "Category 5",
    ]

    const temp = {
        reply_markup: {
            inline_keyboard: []
        }
    }; 
    
    categories.forEach((cat) => {
        temp.reply_markup.inline_keyboard.push([
            {
                text: cat,
                callback_data: cat
            }
        ])
    
        temp.reply_markup.inline_keyboard.push([])
    })
    
    temp.reply_markup.inline_keyboard.push([
        {
            text: "Return to Menu",
            callback_data: "return"
        }
    ])




    changeInlineKeyboard("This is Our Categories", bot, temp.reply_markup, chatId, query)

    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        const selected = query.data;
        categories.forEach((cat) => {
            if(selected == cat){
                sendProductMessages(chatId, bot, cat, query)
            }
        })
        if(selected == 'return'){
            changeInlineKeyboard("Here is our Menu!", bot, menu.reply_markup, chatId, query)
        }
    })
}
