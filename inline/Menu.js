export const menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Categories",
                    callback_data: "categories"
                },
                {
                    text: "Cart",
                    callback_data: "cart"
                }
            ],
            [  
            ],
            [
                {
                    text: "History",
                    callback_data: "history"
                },
                {
                    text: "Exit",
                    callback_data: "exit"
                }
            ]
        ]
    }
};