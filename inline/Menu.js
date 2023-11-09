import { Markup } from 'telegraf';
import { bot } from '../index.js';

export const menu = Markup.inlineKeyboard([
    Markup.button.callback('Categories', 'categories'),
    Markup.button.callback('Cart', 'cart'),
    Markup.button.callback('Admin Settings', 'admin'),
    Markup.button.callback('History', 'history'),
    Markup.button.callback('Exit', 'exit')
]);

bot.action('categories', (ctx) => {
    // Call your sendCatMenu function here.
});

bot.action('cart', (ctx) => {
    // Call your sendCartContents function here.
});

bot.action('history', (ctx) => {
    ctx.editMessageText('Fetching History Data...');
    // You can handle history data retrieval here.
});

bot.action('admin', (ctx) => {
    ctx.editMessageText("Welcome Owner, what do you want to do with your Store today?");
    // You can call your Admin related functions here.
});
