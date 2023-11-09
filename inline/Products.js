import { menu } from "./Menu.js";
import { changeInlineKeyboard } from "../lib/util.js";

const products = [
    {
        title: "Product 1",
        img: "https://random.imagecdn.app/500/300",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem neque, euismod non libero eget, pharetra aliquet felis. Cras id neque pharetra, hendrerit urna at, rutrum risus. Maecenas in ultrices metus. Donec pulvinar, nibh sit amet imperdiet consequat, orci dui pharetra purus, nec efficitur elit nunc eu justo. Phasellus ut sodales libero. Aenean vel dictum tortor. Vivamus sed odio lacus. Vivamus finibus sagittis dui, ac dictum nisl ultricies sed. Donec id mi fringilla, ultrices magna non, volutpat ipsum. Vivamus et mattis turpis. Duis rutrum lectus at auctor porttitor. Praesent auctor massa mi, nec posuere diam tincidunt laoreet. Nulla facilisi. Sed consequat sit amet justo et tempor.",
        price: 12.00,
        stock: 10
    },
    {
        title: "Product 2",
        img: "https://random.imagecdn.app/500/300",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem neque, euismod non libero eget, pharetra aliquet felis. Cras id neque pharetra, hendrerit urna at, rutrum risus. Maecenas in ultrices metus. Donec pulvinar, nibh sit amet imperdiet consequat, orci dui pharetra purus, nec efficitur elit nunc eu justo. Phasellus ut sodales libero. Aenean vel dictum tortor. Vivamus sed odio lacus. Vivamus finibus sagittis dui, ac dictum nisl ultricies sed. Donec id mi fringilla, ultrices magna non, volutpat ipsum. Vivamus et mattis turpis. Duis rutrum lectus at auctor porttitor. Praesent auctor massa mi, nec posuere diam tincidunt laoreet. Nulla facilisi. Sed consequat sit amet justo et tempor.",
        price: 10.00,
        stock: 10
    },
    {
        title: "Product 3",
        img: "https://random.imagecdn.app/500/300",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem neque, euismod non libero eget, pharetra aliquet felis. Cras id neque pharetra, hendrerit urna at, rutrum risus. Maecenas in ultrices metus. Donec pulvinar, nibh sit amet imperdiet consequat, orci dui pharetra purus, nec efficitur elit nunc eu justo. Phasellus ut sodales libero. Aenean vel dictum tortor. Vivamus sed odio lacus. Vivamus finibus sagittis dui, ac dictum nisl ultricies sed. Donec id mi fringilla, ultrices magna non, volutpat ipsum. Vivamus et mattis turpis. Duis rutrum lectus at auctor porttitor. Praesent auctor massa mi, nec posuere diam tincidunt laoreet. Nulla facilisi. Sed consequat sit amet justo et tempor.",
        price: 5.00,
        stock: 10
    },
];


export const sendProductMessages = async (chatId, funcBot, categories, query) => {
    // Check if the message content needs to be updated before editing
    const newCategoryText = `${categories} Category Selected`;

    try {
        const categoryMessageId = query.message.message_id;
        const productMessages = [categoryMessageId];

        if (query.message.text !== newCategoryText) {
            await funcBot.editMessageText(newCategoryText, {
                chat_id: chatId,
                message_id: categoryMessageId,
                parse_mode: 'Markdown',
            });
        }

        const productPromises = products.map(async (item) => {
            const productMessage = `
[Product Image](${item.img})
Title: ${item.title}
Description: ${item.description}
Price: PHP${item.price}
            `;

            const productMarkup = {
                inline_keyboard: [
                    [
                        {
                            text: `Buy Now(${item.stock})`,
                            callback_data: 'buy'
                        }
                    ],
                    [],
                    [
                        {
                            text: "Add to Cart",
                            callback_data: 'add'
                        }
                    ],
                    [],
                    [
                        {
                            text: "Add to Favorites",
                            callback_data: "favorites"
                        }
                    ]
                ]
            };

            try {
                const sentMessage = await funcBot.sendMessage(chatId, productMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: productMarkup,
                });
                productMessages.push(sentMessage.message_id);
            } catch (error) {
                console.error("Error sending product message:", error);
            }
        });

        await Promise.all(productPromises);
        const sentExit = await funcBot.sendMessage(chatId, "Menu", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Return to Menu",
                            callback_data: "return_menu",
                        }
                    ]
                ]
            }
        });

        productMessages.push(sentExit.message_id);

        funcBot.on('callback_query', (query) => {
            const newChatId = query.message.chat.id;
            const selection = query.data;

            if (selection == 'return_menu') {
                if (productMessages.length > 0) {
                    productMessages.forEach((messageId, index) => {
                        try {
                            funcBot.deleteMessage(chatId, messageId);
                            delete productMessages[index];
                        } catch (err) {
                            console.log(err);
                        }
                    });
                }
                funcBot.sendMessage(chatId, "Here is Our Menu", {
                    reply_markup: menu.reply_markup
                });
            }
        });
    } catch (error) {
        console.error("Error in sendProductMessages:", error);
    }
};

