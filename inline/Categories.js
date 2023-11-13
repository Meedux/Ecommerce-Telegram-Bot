import { Markup } from 'telegraf';
import { sendProductMessages } from './Products.js';
import { menu } from './Menu.js';

const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];

// Create buttons for each category
const buttons = [];

categories.forEach((category) => {
    buttons.push([Markup.button.callback(category, category)])
});
// Add a button for returning to the menu
buttons.push([Markup.button.callback('Return to Menu', 'return')]);

const inlineKeyboard = Markup.inlineKeyboard(buttons);

export const sendCatMenu = (ctx, bot) => {
    ctx.editMessageText('This is Our Categories', inlineKeyboard);

    bot.action(categories, (ctx) => {
        const selected = ctx.match;
        sendProductMessages(ctx, selected, bot);
    });

    bot.action('return', (ctx) => {
        ctx.editMessageText('Here is our Menu', { reply_markup: menu.reply_markup });
    });
};