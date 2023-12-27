import { menu } from "./Menu.js";
import { getCartItems, getCartProducts, getUser } from "../lib/util.js";
import { Product, User } from "../index.js";
import { Scenes, Markup } from "telegraf";

export const CartScene = new Scenes.WizardScene("CART", 
    async (ctx) => {
        const user = await getUser(ctx.from.id);
        const cartItems = await getCartItems(user.id);
        const products = await getCartProducts(cartItems);
        ctx.scene.state.productMessages = [];
        const renderProducts = products.map(async (item) => {
            const productMessage = `
                [Product Image](${item.img})
                Title: ${item.title}
                Description: ${item.description}
                Price: PHP${item.price}
            `;

            const buttons = [];
            buttons.push([Markup.button.callback(`🗑) Remove Product`, `remove_${item.id}`)])
            buttons.push([Markup.button.callback(`🔢) Update Quantity`, `update_${item.id}`)])

            const inlineKeyboard = Markup.inlineKeyboard(buttons).reply_markup;

            try {
                const sentProductMessage = await ctx.reply(productMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: inlineKeyboard,
                });
                ctx.scene.state.productMessages.push(sentProductMessage.message_id);

                buttons.forEach((item, index) => {
                    delete buttons[index];
                })
            } catch (error) {
                console.error('Error sending product message:', error);
            }
        });
        await Promise.all(renderProducts);

        const rt = Markup.inlineKeyboard([
            [Markup.button.callback("🎁) Checkout", "checkout")],
            [Markup.button.callback("📃) Return to Menu", "return_menu")]
        ]);
        const rt_msg = await ctx.reply("Menu", rt);
        ctx.scene.state.productMessages.push(rt_msg.message_id)
    }
)

CartScene.action(/^remove_[0-9]+$/, async (ctx) => {

})

CartScene.action(/^update_[0-9]+$/, async (ctx) => {

})

CartScene.action("checkout", async (ctx) => {

})

CartScene.action("return_menu", async (ctx) => {
    ctx.scene.state.productMessages.forEach(async (messageId, index) => {
        try {
            await ctx.deleteMessage(messageId);
            delete ctx.scene.state.productMessages[index];
        } catch (err) {
            console.log(err);
        }
    });
    await ctx.reply('Here is Our Menu', { reply_markup: menu.reply_markup });
    await ctx.scene.leave();
})

export const sendCartContents = async (ctx) =>{
    try {
        await ctx.deleteMessage();
        await ctx.scene.enter("CART")
    } catch (error) {
        console.error('Error in sendCartContents:', error);
    }
}