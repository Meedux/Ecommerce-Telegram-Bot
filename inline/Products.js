import { menu } from './Menu.js';
import { Markup } from 'telegraf';
import { Product, CartItems, Order, User } from '../index.js';
import { Scenes } from 'telegraf';
import { getProductsByCategory } from '../lib/util.js';

export const ProductScene = new Scenes.WizardScene("PRODUCTS", 
    async (ctx) => {
        const products = await getProductsByCategory(ctx.scene.state.categoryID);
        ctx.scene.state.productMessages = [];
        const productPromises = products.map(async (item) => {
            const productMessage = `
                [Product Image](${item.img})
                Title: ${item.title}
                Description: ${item.description}
                Price: PHP${item.price}
            `;

            const buttons = [];
            buttons.push([Markup.button.callback(`👔) Buy Now(${item.stock})`, `buy_${item.id}`)])
            buttons.push([Markup.button.callback(`🛒) Add to Cart`, `add_${item.id}`)])
            // buttons.push([Markup.button.callback(`💖) Add to Favorites`, `favorites_${item.title}`)])

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

        await Promise.all(productPromises);

        const rt = Markup.inlineKeyboard([Markup.button.callback("📃) Return to Menu", "return_menu")]);
        const rt_msg = await ctx.reply("Return", rt);
        ctx.scene.state.productMessages.push(rt_msg.message_id)
    }
)

// Add to Cart Action Handler
ProductScene.action(/^add_[0-9]+$/, async (ctx) => {
    const prodID = parseInt(ctx.match[0].split('_')[1], 10);
    const product = await Product.findOne({ where: { id: prodID }})
    const userID = await User.findOne({ where: { UserID: ctx.from.id }})
    // console.log(`Product: ${prodID}, User: ${userID.UserName}`)
    CartItems.create({
        ProductId: prodID,
        UserId: userID.id,
        Quantity: 1,
        Price: product.price
    })

    ctx.scene.state.productMessages.forEach(async (messageId, index) => {
        try {
            await ctx.deleteMessage(messageId);
            delete ctx.scene.state.productMessages[index];
        } catch (err) {
            console.log(err);
        }
    });
    await ctx.reply(`Product, ${product.title} has been added to your Cart!`)
    await ctx.reply('Here is Our Menu', { reply_markup: menu.reply_markup });
    await ctx.scene.leave()
})

// Buy Now Action Handler
ProductScene.action(/^buy_[0-9]+$/, async (ctx) => {
    const prodID = parseInt(ctx.match[0].split('_')[1], 10);
    const product = await Product.findOne({ where: { id: prodID }})
    const userID = await User.findOne({ where: { UserID: ctx.from.id }})

    CartItems.create({
        ProductId: prodID,
        UserId: userID.id,
        Quantity: 1,
        Price: product.price
    })

    Order.create({
        UserId: userID.id
    })

    ctx.scene.state.productMessages.forEach(async (messageId, index) => {
        try {
            await ctx.deleteMessage(messageId);
            delete ctx.scene.state.productMessages[index];
        } catch (err) {
            console.log(err);
        }
    });

    await ctx.reply(`Order has been generated, please wait for your Order!`)
    await ctx.reply('Here is Our Menu', { reply_markup: menu.reply_markup });
    await ctx.scene.leave();
})

ProductScene.action("return_menu", async (ctx) => {
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




export const sendProductMessages = async (ctx, categories, bot, categoryID) => {
    try {
        await ctx.deleteMessage();
        await ctx.scene.enter("PRODUCTS", {categoryID})
    } catch (error) {
        console.error('Error in sendProductMessages:', error);
    }
};
