import { Markup } from 'telegraf';

export async function changeInlineKeyboard(text, ctx, markup) {
    try {
        await ctx.editMessageText(text, markup);
    } catch (error) {
        console.log(error);
    }
}

