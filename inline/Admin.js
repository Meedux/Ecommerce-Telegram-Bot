import { menu } from "./Menu.js";

export const AdminInlineKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Add Product",
                    callback_data: "add_product"
                },
                {
                    text: "Update Product Details",
                    callback_data: "update_product"
                },
            ],
            [

            ],
            [
                {
                    text: "Delete Product",
                    callback_data: "delete_product"
                },
            ]
        ]
    }
}

export const sendAdminKeyboard = async (chatId, funcBot, categories, query) => {


    funcBot.on("callback_query", (query) => {

    });
}