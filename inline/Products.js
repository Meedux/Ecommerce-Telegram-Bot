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

        const buttons = products.map((item) => [
            {
                text: `Buy Now(${item.stock})`,
                callback_data: `buy_${item.title}`,
            },
            {},
            {
                text: 'Add to Cart',
                callback_data: `add_${item.title}`,
            },
            {},
            {
                text: 'Add to Favorites',
                callback_data: `favorites_${item.title}`,
            },
        ]);

        buttons.push([
            {
                text: 'Return to Menu',
                callback_data: 'return_menu',
            },
        ]);

        const inlineKeyboard = Markup.inlineKeyboard(buttons).reply_markup;

        const productPromises = products.map(async (item) => {
            const productMessage = `
[Product Image](${item.img})
Title: ${item.title}
Description: ${item.description}
Price: PHP${item.price}
            `;

            try {
                const sentProductMessage = await ctx.reply(productMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: inlineKeyboard,
                });
                productMessages.push(sentProductMessage.message_id);
            } catch (error) {
                console.error('Error sending product message:', error);
            }
        });

        await Promise.all(productPromises);

        bot.action('return_menu', async (ctx) => {
            if (productMessages.length > 0) {
                productMessages.forEach(async (messageId, index) => {
                    try {
                        await ctx.deleteMessage(messageId);
                        delete productMessages[index];
                    } catch (err) {
                        console.log(err);
                    }
                });
            }
            await ctx.reply('Here is Our Menu', { reply_markup: menu.reply_markup });
        });
    } catch (error) {
        console.error('Error in sendProductMessages:', error);
    }
};
