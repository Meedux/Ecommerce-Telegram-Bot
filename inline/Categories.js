import { Markup } from 'telegraf';
import { sendProductMessages } from './Products.js';
import { menu } from './Menu.js';
import { Category } from '../index.js';

export const sendCatMenu = async (ctx, bot) => {
    const categories = await Category.findAll();
    const buttons = [];
    
    categories.forEach((category) => {
        buttons.push([Markup.button.callback("🧧)"+category.Name, category.Name)])
    });
    
    buttons.push([Markup.button.callback('📃)Return to Menu', 'return')]);
    
    const inlineKeyboard = Markup.inlineKeyboard(buttons);
    ctx.editMessageText('This is Our Categories', inlineKeyboard);

    categories.forEach((category) => {
        bot.action(category.Name, (ctx) => {
            const selected = ctx.match;
            sendProductMessages(ctx, selected, bot, category.id);
        });
    });

    bot.action('return', (ctx) => {
        ctx.editMessageText('Here is our Menu', { reply_markup: menu.reply_markup });
    });
};