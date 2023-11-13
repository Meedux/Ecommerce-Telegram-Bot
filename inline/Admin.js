import { Markup } from "telegraf";
import { menu } from "./Menu.js";
import { changeInlineKeyboard } from "../lib/util.js";

export const AdminInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("➕) Add Product", "add")],
    [Markup.button.callback("👔) Update Product Details", "update")],
    [Markup.button.callback("🚮) Delete Product", "delete")],
    [Markup.button.callback("📃) Return to Menu", "return")]
])

export const sendAdminKeyboard = async (ctx, bot) => {
    changeInlineKeyboard("Hello Owner! What do you want to do today?", ctx, AdminInlineKeyboard);

    bot.action('return', (ctx) => {
        changeInlineKeyboard("This is Our Menu", ctx, menu)
    })
}