import { menu } from "./Menu.js";
import { changeInlineKeyboard } from "../lib/util.js";

const products = [
    {
        title: "Product 1",
        img: "https://random.imagecdn.app/500/300",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem neque, euismod non libero eget, pharetra aliquet felis. Cras id neque pharetra, hendrerit urna at, rutrum risus. Maecenas in ultrices metus. Donec pulvinar, nibh sit amet imperdiet consequat, orci dui pharetra purus, nec efficitur elit nunc eu justo. Phasellus ut sodales libero. Aenean vel dictum tortor. Vivamus sed odio lacus. Vivamus finibus sagittis dui, ac dictum nisl ultricies sed. Donec id mi fringilla, ultrices magna non, volutpat ipsum. Vivamus et mattis turpis. Duis rutrum lectus at auctor porttitor. Praesent auctor massa mi, nec posuere diam tincidunt laoreet. Nulla facilisi. Sed consequat sit amet justo et tempor.",
        price: 12.00
    },
    {
        title: "Product 2",
        img: "https://random.imagecdn.app/500/300",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem neque, euismod non libero eget, pharetra aliquet felis. Cras id neque pharetra, hendrerit urna at, rutrum risus. Maecenas in ultrices metus. Donec pulvinar, nibh sit amet imperdiet consequat, orci dui pharetra purus, nec efficitur elit nunc eu justo. Phasellus ut sodales libero. Aenean vel dictum tortor. Vivamus sed odio lacus. Vivamus finibus sagittis dui, ac dictum nisl ultricies sed. Donec id mi fringilla, ultrices magna non, volutpat ipsum. Vivamus et mattis turpis. Duis rutrum lectus at auctor porttitor. Praesent auctor massa mi, nec posuere diam tincidunt laoreet. Nulla facilisi. Sed consequat sit amet justo et tempor.",
        price: 10.00
    },
    {
        title: "Product 3",
        img: "https://random.imagecdn.app/500/300",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sem neque, euismod non libero eget, pharetra aliquet felis. Cras id neque pharetra, hendrerit urna at, rutrum risus. Maecenas in ultrices metus. Donec pulvinar, nibh sit amet imperdiet consequat, orci dui pharetra purus, nec efficitur elit nunc eu justo. Phasellus ut sodales libero. Aenean vel dictum tortor. Vivamus sed odio lacus. Vivamus finibus sagittis dui, ac dictum nisl ultricies sed. Donec id mi fringilla, ultrices magna non, volutpat ipsum. Vivamus et mattis turpis. Duis rutrum lectus at auctor porttitor. Praesent auctor massa mi, nec posuere diam tincidunt laoreet. Nulla facilisi. Sed consequat sit amet justo et tempor.",
        price: 5.00
    },
]


export const sendProductMessages = async (chatId, funcBot, categories, query) => {
    const productMessages = []

    funcBot.editMessageText(`${categories} Category Selected`, {
        chat_id: chatId,
        message_id: query.message.message_id
    });

    productMessages.push(query.message.message_id)

    const productPromises = products.map((item) => {
        const productMessage = `
[Product Image](${item.img})
Title: ${item.title}
Description: ${item.description}
Price: PHP${item.price}
        `;

        const productMarkup = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Buy Now",
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
            }
        }

        return funcBot.sendMessage(chatId, productMessage, 
            { 
                parse_mode: 'Markdown', 
                reply_markup: productMarkup.reply_markup 
            })
            .then((sentMessage) => {
                productMessages.push(sentMessage.message_id);
            });
    });

    await Promise.all(productPromises);

    await funcBot.sendMessage(chatId, "Menu", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Return to Menu",
                        callback_data: "return_menu"
                    }
                ]
            ]
        }
    });

    funcBot.on('callback_query', (query) => {
        const newChatId = query.message.chat.id;
        const selection = query.data;

        if (selection == 'return_menu') {
            if(productMessages.length > 0){
                productMessages.forEach((messageId) => {
                    funcBot.deleteMessage(chatId, messageId);
                });
            }
            changeInlineKeyboard("Here is our Menu!", funcBot, menu.reply_markup, newChatId, query)
        }
    });
}

