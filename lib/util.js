import { Markup } from 'telegraf';
import { User } from '../index.js';

export async function changeInlineKeyboard(text, ctx, markup) {
    try {
        await ctx.editMessageText(text, markup);
    } catch (error) {
        console.log(error);
    }
}

export async function checkUserID(userId, userName){
    await User.findOrCreate({
        where: {
            UserID: userId
        },
        defaults: {
            UserID: userId,
            UserName: userName,
        }
    })
}