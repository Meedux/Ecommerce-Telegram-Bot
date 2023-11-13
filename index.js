import { Telegraf, Markup,  } from "telegraf";
import { changeInlineKeyboard } from "./lib/util.js";
import { menu } from "./inline/Menu.js";
import { sendCartContents } from "./inline/Cart.js";
import { sendCatMenu } from "./inline/Categories.js";
import { sendAdminKeyboard } from "./inline/Admin.js";

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
    
    bot.action('categories', (ctx) => {
        sendCatMenu(ctx, bot);
    });
    
    bot.action('cart', (ctx) => {
        // Call your sendCartContents function here.
        
    });
    
    bot.action('history', (ctx) => {
        ctx.editMessageText('Fetching History Data...');
    });
    
    bot.action('admin', (ctx) => {
        sendAdminKeyboard(ctx, bot);
    });

    bot.action('exit', (ctx) => {
        ctx.editMessageText("Goodbye Customer! 😁");

    });
    
    await bot.launch();
})()
export { bot };