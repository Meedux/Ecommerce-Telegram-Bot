import { Telegraf, Markup, session,  } from "telegraf";
import { changeInlineKeyboard, checkUserID } from "./lib/util.js";
import { menu } from "./inline/Menu.js";
import { sendCatMenu } from "./inline/Categories.js";
import { sendAdminKeyboard } from "./inline/Admin.js";
import { testDatabase } from "./lib/db.js";
import { Sequelize } from "sequelize";
import { SynchroniseModels, defineModels } from "./lib/models.js";
import { Scenes } from "telegraf";
import { AddCatScene, UpdateCatScene,DeleteCatScene, AddProductScene, UpdateProductScene } from "./inline/Admin.js";

const db = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASS, {
    host: 'localhost',
    dialect: 'mysql'
})
const bot = new Telegraf(process.env.TELEGRAMKEY);
const stage = new Scenes.Stage([AddCatScene, UpdateCatScene, DeleteCatScene, AddProductScene, UpdateProductScene])

const { Product, User, Category } = defineModels(db);

(async () => {
    try {
        bot.use(session())
        bot.use(stage.middleware())
            await db.authenticate(); 
            console.log('Connection to database successful.');
            await SynchroniseModels(db); 
            bot.start(async (ctx) => {
                const chatId = ctx.chat.id;
                const userId = ctx.from.id;
                const userName = ctx.from.username;
                
                const inlineKeyboard = Markup.inlineKeyboard([
                    Markup.button.callback("Yes", "Yes"),
                    Markup.button.callback("No", "No")
                ]);
                await SynchroniseModels(db);

                await checkUserID(userId, userName);
                await ctx.reply("Welcome to the Commerce Bot! Would you like to shop?", inlineKeyboard);
            });
            
            bot.action('Yes', (ctx) => {
                const chatId = ctx.chat.id;
                console.log('Menu');
                changeInlineKeyboard('Here is our Menu!', ctx, menu);
            });
            
            bot.action('No', (ctx) => {
                ctx.editMessageText("Bot is now Closing. Thank you for shopping with us :).");
            });
            
            bot.action('categories', (ctx) => {
                sendCatMenu(ctx, bot);
            });
            
            bot.action('cart', (ctx) => {
                // Call your sendCartContents function here.
                
            });
            
            bot.action('history', (ctx) => {
                ctx.editMessageText('Fetching History Data...');
            });
            
            bot.action('admin', (ctx) => {
                sendAdminKeyboard(ctx, bot);
            });
        
            bot.action('exit', (ctx) => {
                ctx.editMessageText("Goodbye Customer! 😁");
        
            });
            
            await bot.launch();
        }catch (error) {
            console.error('Error connecting to the database:', error);
        }
})();

export { 
    bot, 
    db, 
    Product, 
    User, 
    Category 
};