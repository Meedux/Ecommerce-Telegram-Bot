import { menu } from './Menu.js';
import { Markup } from 'telegraf';

const products = [
    {
        title: 'Product 1',
        img: 'https://random.imagecdn.app/500/300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        price: 12.00,
        stock: 10,
    },
    {
        title: 'Product 2',
        img: 'https://random.imagecdn.app/500/300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        price: 10.00,
        stock: 10,
    },
    {
        title: 'Product 3',
        img: 'https://random.imagecdn.app/500/300',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        price: 5.00,
        stock: 10,
    },
];

export const sendProductMessages = async (ctx, categories, bot) => {
    try {
        const newCategoryText = `${categories} Category Selected`;

        const sentMessage = await ctx.editMessageText(newCategoryText, {
            parse_mode: 'Markdown',
        });

        const productMessages = [sentMessage.message_id];
        
        const productPromises = products.map(async (item) => {
            const productMessage = `
[Product Image](${item.img})
Title: ${item.title}
Description: ${item.description}
Price: PHP${item.price}
`;

            const buttons = [];
            buttons.push([Markup.button.callback(`👔) Buy Now(${item.stock})`, `buy_${item.title}`)])
            buttons.push([Markup.button.callback(`🛒) Add to Cart`, `add_${item.title}`)])
            buttons.push([Markup.button.callback(`💖) Add to Favorites`, `favorites_${item.title}`)])

            const inlineKeyboard = Markup.inlineKeyboard(buttons).reply_markup;

            try {
                const sentProductMessage = await ctx.reply(productMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: inlineKeyboard,
                });
                productMessages.push(sentProductMessage.message_id);

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

        productMessages.push(rt_msg.message_id)

        bot.action('return_menu', async (ctx) => {
            productMessages.forEach(async (messageId, index) => {
                try {
                    await ctx.deleteMessage(messageId);
                    delete productMessages[index];
                } catch (err) {
                    console.log(err);
                }
            });
            await ctx.reply('Here is Our Menu', { reply_markup: menu.reply_markup });
        });
    } catch (error) {
        console.error('Error in sendProductMessages:', error);
    }
};
