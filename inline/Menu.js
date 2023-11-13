import { Markup } from 'telegraf';
import { bot } from '../index.js';

export const menu = Markup.inlineKeyboard([
    [Markup.button.callback('🎁) Categories', 'categories'), Markup.button.callback('🛒) Cart', 'cart')],
    [Markup.button.callback('🦺) Admin Settings', 'admin')],
    [Markup.button.callback('🖼) History', 'history')],
    [Markup.button.callback('Exit', 'exit')]
]);

