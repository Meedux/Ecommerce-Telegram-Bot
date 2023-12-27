import { Markup } from 'telegraf';
import { User, Product, CartItems } from '../index.js';

export async function changeInlineKeyboard(text, ctx, markup) {
    try {
        await ctx.editMessageText(text, markup);
    } catch (error) {
        console.log(error);
    }
}

export async function checkUserID(userId, userName){
    await User.findOrCreate({
        where: {
            UserID: userId
        },
        defaults: {
            UserID: userId,
            UserName: userName,
        }
    })
}

export const getProductsByCategory = async (category) => {
    const product = await Product.findAll({
        where: {
            CategoryId: category
        }
    });
    return product;
}

export const getCartProducts = async (cart) => {
    const products = await Product.findAll();
    const cartProd = [];

    products.forEach(product => {
        cart.forEach(item => {
            if(product.id == item.ProductId){
                cartProd.push(product);
            }
        })
    })

    return cartProd;
}

export const getCartItems = async (userId) => {
    return await CartItems.findAll({ where: { UserId: userId } });
}

export const getUser = async (id) => {
    return await User.findOne({ where: { UserID: id }});
}
