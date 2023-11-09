import { Telegraf, Markup,  } from "telegraf";
import { changeInlineKeyboard } from "./lib/util.js";
import { menu } from "./inline/Menu.js";

const bot = new Telegraf(process.env.TELEGRAMKEY);
(async () => {
    bot.start((ctx) => {
        const chatId = ctx.chat.id;
        const userId = ctx.from.id;
    
        const inlineKeyboard = Markup.inlineKeyboard([
            Markup.button.callback("Yes", "Yes"),
            Markup.button.callback("No", "No")
        ]);
    
        ctx.reply("Welcome to the Commerce Bot! Would you like to shop?", inlineKeyboard);
    });
    
    bot.action('Yes', (ctx) => {
        const chatId = ctx.chat.id;
        console.log('Menu');
        changeInlineKeyboard('Here is our Menu!', ctx, menu);
    });
    
    bot.action('No', (ctx) => {
        ctx.editMessageText("Bot is now Closing. Thank you for shopping with us :).");
    });
    
    
    
    await bot.launch();
})()
export { bot };