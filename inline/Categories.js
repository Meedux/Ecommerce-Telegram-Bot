import { Markup } from 'telegraf';

const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];

const buttons = categories.map((category) =>
    Markup.button.callback(category, category)
);

buttons.push(Markup.button.callback('Return to Menu', 'return'));

const inlineKeyboard = Markup.inlineKeyboard(buttons).reply_markup;

export const sendCatMenu = (chatId, ctx) => {
    ctx.reply('This is Our Categories', inlineKeyboard);

    ctx.action(categories, (ctx) => {
        const selected = ctx.match;
        sendProductMessages(chatId, ctx, selected);
    });

    ctx.action('return', (ctx) => {
        ctx.editMessageText('Here is our Menu', { reply_markup: menu.reply_markup });
    });
};
