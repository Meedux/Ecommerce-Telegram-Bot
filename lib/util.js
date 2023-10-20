export function changeInlineKeyboard(text, bot, markup, chatId, query){
    try{
        bot.editMessageText(text, {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: markup
        });
    }catch(error){
        console.log(error)
    }
}