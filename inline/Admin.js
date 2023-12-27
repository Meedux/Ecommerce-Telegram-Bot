import { Markup } from "telegraf";
import { menu } from "./Menu.js";
import { changeInlineKeyboard } from "../lib/util.js";
import { Product, Category } from "../index.js";
import { storage, uploadImage } from "../lib/firebase.js";
import { Scenes } from "telegraf";

// SCENES
export const AddCatScene = new Scenes.WizardScene("ADD_CATEGORY",
    async (ctx) => {
        ctx.state.catName = "";
        await ctx.deleteMessage();
        await ctx.reply('Please provide the name for the new category.');
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.state.catName = ctx.message.text;
    
        try {
            await Category.create({
                Name: ctx.state.catName,
                ItemCount: 0,
            });

            await ctx.reply(`Category '${ctx.state.catName}' has been added.`);
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            return ctx.scene.leave();        
        } catch (error) {
            console.error('Error creating a new category:', error);
            await ctx.reply('An error occurred while adding the category. Please try again.');
            return ctx.scene.leave();
        }
    }
)

export const UpdateCatScene = new Scenes.WizardScene("UPDATE_CATEGORY", 
    async (ctx) => {
        try {
            ctx.state.existingCategories = await Category.findAll();
            ctx.state.categoryButtons = [];
            ctx.state.existingCategories.forEach((category) => 
                ctx.state.categoryButtons.push([Markup.button.callback(category.Name, `update_${category.id}`)])
            );
            ctx.state.categoryButtons.push([Markup.button.callback('Return to Admin Menu', 'return_admin')]);
            ctx.state.inlineKeyboard = Markup.inlineKeyboard(ctx.state.categoryButtons);
            await ctx.reply('Choose a category to update:', ctx.state.inlineKeyboard);
        } catch (error) {
            console.error('Error fetching categories:', error);
            await ctx.reply('An error occurred while fetching categories.');
            return ctx.scene.leave();
        }
    },
    async (ctx) => {
        ctx.state.updatedName = ctx.message.text;
            
        try {
            ctx.state.categoryToUpdate = await Category.findByPk(ctx.session.updatedCategoryId);
            ctx.state.res = await ctx.state.categoryToUpdate?.update({ Name: ctx.state.updatedName });
            if(ctx.state.res){
                await ctx.reply(`Category updated to '${ctx.state.updatedName}'.`);
                await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
                return ctx.scene.leave();
            }else{
                await ctx.reply("ERROR: Failed to Update Category")
                await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
                return ctx.scene.leave();
            }
        } catch (error) {
            await ctx.reply('An error occurred while updating the category. Please try again.');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            return ctx.scene.leave();
        }
    }
)

UpdateCatScene.action(/update_[0-9]+$/, async (ctx) => {
    console.log(ctx.match[0].split('_')[1], 10)
    ctx.session.updatedCategoryId = parseInt(ctx.match[0].split('_')[1], 10);
    await ctx.reply('Please provide the updated name for the category.');
    return ctx.wizard.next();
})

UpdateCatScene.action("return_admin", async (ctx) => {
    await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
    ctx.scene.leave();
})

export const DeleteCatScene = new Scenes.WizardScene("DELETE_CATEGORY", 
    async (ctx) => {
        try {
            const existingCategories = await Category.findAll();
            const categoryButtons = [];
            existingCategories.forEach((category) =>{
                    categoryButtons.push([Markup.button.callback(category.Name, `delete_${category.id}`)])
                    console.log(`${category.Name}, ${category.id}`)
                }
            );
            categoryButtons.push([Markup.button.callback('Return to Admin Menu', 'return_admin')]);
            const inlineKeyboard = Markup.inlineKeyboard(categoryButtons);
            await ctx.reply('Choose a category to delete:', inlineKeyboard);
        } catch (error) {
            console.error('Error fetching categories:', error);
            await ctx.reply('An error occurred while fetching categories.');
            return ctx.scene.leave();
        }
    }
)

DeleteCatScene.action(/delete_[0-9]+$/, async (ctx) => {
    const categoryId = parseInt(ctx.match[0].split('_')[1], 10);
    try {
        const categoryToDelete = await Category.findByPk(categoryId);
        if (!categoryToDelete) {
            await ctx.reply('Category not found.');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            return;
        }
        await Product.update({ CategoryId: 0 }, { where: { CategoryID: categoryId } })
        await categoryToDelete.destroy();
        await ctx.reply(`Category '${categoryToDelete.Name}' has been deleted.`);
        await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
        return ctx.scene.leave();
    } catch (error) {
        console.error('Error deleting category:', error);
        await ctx.reply('An error occurred while deleting the category. Please try again.');
        await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
        return ctx.scene.leave();
    }
})

DeleteCatScene.action('return_admin', async (ctx) => {
    await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
    return ctx.scene.leave();
});


// Products
export const AddProductScene = new Scenes.WizardScene("ADD_PRODUCT", 
    async (ctx) => {
        await ctx.deleteMessage();
        ctx.scene.state.obj = {
            categoryId: 0,
            title: "",
            img: "",
            description: "",
            price: 0,
            stock: 0,
        }
        ctx.scene.state.messageId = []

        ctx.state.categories = await Category.findAll();
        if (ctx.state.categories.length === 0) {
            await ctx.reply('Please create categories first!');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard)
            return;
        }
    
        ctx.state.categoryButtons = [];
        ctx.state.categories.forEach((category) => {
            ctx.state.categoryButtons.push([Markup.button.callback(category.Name, `select_category_${category.id}`)])
        });
        ctx.state.inlineKeyboard = Markup.inlineKeyboard(ctx.state.categoryButtons);
        await ctx.reply('Choose a category:', ctx.state.inlineKeyboard);
    },
    async (ctx) => {
        ctx.scene.state.obj.title = ctx.message.text;
        const temp = await ctx.reply('Please upload the product image:');
        ctx.scene.state.messageId.push(ctx.message.message_id);
        ctx.scene.state.messageId.push(temp.message_id);
        ctx.wizard.next();
    },
    async (ctx) => {
        const fileId = ctx.message.photo[0].file_id;
        const file = await ctx.telegram.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAMKEY}/${file.file_path}`;
        ctx.scene.state.obj.img = await uploadImage(imageUrl); 

        const temp = await ctx.reply('Please provide the product description:');
        ctx.scene.state.messageId.push(ctx.message.message_id)
        ctx.scene.state.messageId.push(temp.message_id)
        ctx.wizard.next();
    },
    async (ctx) => {
        ctx.scene.state.obj.description = ctx.message.text;
        const temp = await ctx.reply('Please provide the base price of the product:');
        
        ctx.scene.state.messageId.push(ctx.message.message_id)
        ctx.scene.state.messageId.push(temp.message_id)
        ctx.wizard.next();
    },
    async (ctx) => {
        ctx.scene.state.obj.price = parseFloat(ctx.message.text);
        const temp = await ctx.reply('Please provide the initial stock quantity:');
        
        ctx.scene.state.messageId.push(ctx.message.message_id)
        ctx.scene.state.messageId.push(temp.message_id)
        ctx.wizard.next();
    },
    async (ctx) => {
        ctx.scene.state.obj.stock = parseInt(ctx.message.text);
        ctx.scene.state.messageId.push(ctx.message.message_id)

        try {
            console.log({
                title: ctx.scene.state.obj.title,
                img: ctx.scene.state.obj.img,
                description: ctx.scene.state.obj.description,
                price: ctx.scene.state.obj.price,
                stock: ctx.scene.state.obj.stock,
                CategoryId: ctx.scene.state.obj.categoryId,
            });
            await Product.create({
                title: ctx.scene.state.obj.title,
                img: ctx.scene.state.obj.img,
                description: ctx.scene.state.obj.description,
                price: ctx.scene.state.obj.price,
                stock: ctx.scene.state.obj.stock,
                CategoryId: ctx.scene.state.obj.categoryId,
            });

            for (const id of ctx.scene.state.messageId) {
                await ctx.telegram.deleteMessage(ctx.chat.id, id);
            }
            await ctx.reply('Product successfully created!');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            ctx.scene.leave();
        } catch (error) {
            console.error('Error creating product:', error);
            await ctx.reply('An error occurred while creating the product.');
            ctx.scene.leave();
        }
    }
)

AddProductScene.action(/^select_category_[0-9]+$/, async (ctx) => {
    await ctx.deleteMessage();
    const categoryIdMatch = ctx.match[0].split('_')[2]; 
    console.log(categoryIdMatch)
    if (categoryIdMatch) {
        const categoryId = parseInt(categoryIdMatch, 10);
        if (!isNaN(categoryId)) {
            ctx.scene.state.obj.categoryId = categoryId;
            console.log(`Category ID: ${categoryId}`);
            const temp = await ctx.reply('Please provide the product title:');
            ctx.scene.state.messageId.push(temp.message_id);
            ctx.wizard.next();
        }
    }
})

export const UpdateProductScene = new Scenes.WizardScene("UPDATE_PRODUCT", 
    async (ctx) => {
        try {
            const products = await Product.findAll();

            ctx.scene.state.productId = "";
            ctx.scene.state.STATE = "";
    
            if (products.length === 0) {
                await ctx.reply('No products available for update!');
                await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
                return;
            }

            const productButtons = products.map((product) =>
                Markup.button.callback(product.title, `select_product_${product.id}`)
            );
    
            const inlineKeyboard = Markup.inlineKeyboard(productButtons);
            await ctx.reply('Choose a product to update:', inlineKeyboard);
        } catch (error) {
            console.error('Error updating product:', error);
            await ctx.reply('An error occurred while updating the product.');
            ctx.scene.leave();
        }
    },
    async (ctx) => {
        try{
            switch(ctx.scene.state.STATE){
                case "Title":{
                    console.log(ctx.message.text)
                    await Product.update({ title: ctx.message.text }, {
                        where: {
                            ID: ctx.scene.state.productId
                        }
                    })
                    await ctx.reply("Product Title Updated!");
                    break;
                }

                case "Image":{
                    const fileId = ctx.message.photo[0].file_id;
                    const file = await ctx.telegram.getFile(fileId);
                    const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAMKEY}/${file.file_path}`;
                    ctx.scene.state.newImg = await uploadImage(imageUrl); 
                    await Product.update({ img: ctx.scene.state.newImg }, {
                        where: {
                            ID: ctx.scene.state.productId
                        }
                    })
                    await ctx.reply("Product Image Updated!");
                    break;
                }

                case "Description":{
                    await Product.update({ description: ctx.message.text }, {
                        where: {
                            ID: ctx.scene.state.productId
                        }
                    })
                    await ctx.reply("Product Description Updated!");
                    break;
                }

                case "Price":{
                    await Product.update({ price: parseFloat(ctx.message.text) }, {
                        where: {
                            ID: ctx.scene.state.productId
                        }
                    })
                    await ctx.reply("Product Price Updated!");
                    break;
                }

                case "Stock":{
                    await Product.update({ stock: parseFloat(ctx.message.text) }, {
                        where: {
                            ID: ctx.scene.state.productId
                        }
                    })
                    await ctx.reply("Product Stock Updated!");
                    break;
                }
            }
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            ctx.scene.leave();
        } catch (error) {
            console.error('Error updating product:', error);
            await ctx.reply('An error occurred while updating the product.');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            ctx.scene.leave();
        }
    }
)

UpdateProductScene.action(/^select_product_[0-9]+$/, async (ctx) => {
    ctx.scene.state.productId = parseInt(ctx.match[0].split('_')[1], 10);
    await ctx.reply('Choose what to update:', UpdateProductInlineKeyboard);
});

UpdateProductScene.action("update_product_category", async (ctx) => {
    ctx.state.categories = await Category.findAll();
    ctx.state.categoryButtons = [];
    ctx.state.categories.forEach((category) =>
        ctx.state.categoryButtons.push([Markup.button.callback(category.Name, `update_category_${category.ID}`)])
    );
    ctx.state.inlineKeyboard = Markup.inlineKeyboard(ctx.state.categoryButtons);
    await ctx.reply('Choose a New category for the Product:', ctx.state.inlineKeyboard);
})

// AddProductScene.action(/^select_category_[0-9]+$/, async (ctx) => {

//     ctx.scene.leave();
// })

UpdateProductScene.action("update_product_title", async (ctx) => {
    ctx.scene.state.STATE = "Title";
    await ctx.reply("Enter the New Name of the Product: ");
    ctx.wizard.next();
})

UpdateProductScene.action("update_product_img", async (ctx) => {
    ctx.scene.state.STATE = "Image";
    await ctx.reply("Enter the New Image of the Product: ");
    ctx.wizard.next();
})

UpdateProductScene.action("update_product_description", async (ctx) => {
    ctx.scene.state.STATE = "Description";
    await ctx.reply("Enter the New Description of the Product: ");
    ctx.wizard.next();
})

UpdateProductScene.action("update_product_price", async (ctx) => {
    ctx.scene.state.STATE = "Price";
    await ctx.reply("Enter the New Price of the Product: ");
    ctx.wizard.next();
})

UpdateProductScene.action("update_product_stock", async (ctx) => {
    ctx.scene.state.STATE = "Stock";
    await ctx.reply("Enter the New Stock of the Product: ");
    ctx.wizard.next();
})

UpdateProductScene.action("return_admin", async (ctx) => {
    changeInlineKeyboard("Hello Owner! What do you want to do today?", ctx, AdminInlineKeyboard);
    ctx.scene.leave();
})

UpdateProductScene.action("return", async (ctx) => {
    changeInlineKeyboard("This is Our Menu", ctx, menu)
    ctx.scene.leave();
})


// DELETE_PRODUCT_SCENE
export const DeleteProductScene = new Scenes.WizardScene("DELETE_PRODUCT", 
    async (ctx) => {
        ctx.state.categoryId = 0;
        ctx.state.productId = 0
        ctx.state.categories = await Category.findAll();
        if (ctx.state.categories.length === 0) {
            await ctx.reply('Please create categories first!');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard)
            return;
        }
    
        ctx.state.categoryButtons = [];
        ctx.state.categories.forEach((category) => {
            ctx.state.categoryButtons.push([Markup.button.callback(category.Name, `select_category_${category.id}`)])
        });
        ctx.state.inlineKeyboard = Markup.inlineKeyboard(ctx.state.categoryButtons);
        await ctx.reply('Choose a category:', ctx.state.inlineKeyboard);
    },
    async (ctx) => {
        const productItems = await Product.findAll({ where: {CategoryID: ctx.state.categoryId} });
        console.log(productItems)
        const productButtons = [];

        productItems.forEach((item) => {
            productButtons.push([Markup.button.callback(item.title, `delete_product_${product.id}`)])
        })

        ctx.state.inlineKeyboard = Markup.inlineKeyboard(productButtons);
        await ctx.reply('Choose a category:', ctx.state.inlineKeyboard);
    }
)

DeleteProductScene.action(/^select_category_[0-9]+$/, async (ctx) => {
    const categoryIdMatch = ctx.match[0].split('_')[2];
    const categoryId = parseInt(categoryIdMatch, 10);
    ctx.scene.state.categoryId = categoryId;
    ctx.wizard.next();
})

DeleteProductScene.action(/^delete_product_[0-9]+$/, async (ctx) => {
    const itemtoDeleteID = ctx.match[0].split('_')[2]; 
    try {
        const productToDelete = await Category.findByPk(itemtoDeleteID);
        if (!productToDelete) {
            await ctx.reply('Product not found.');
            await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
            return;
        }
        await productToDelete.destroy();
        await ctx.reply(`Product '${productToDelete.Name}' has been deleted.`);
        await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
        return ctx.scene.leave();
    } catch (error) {
        console.error('Error deleting Product:', error);
        await ctx.reply('An error occurred while deleting the Product. Please try again.');
        await ctx.reply("Hello Owner! What do you want to do today?", AdminInlineKeyboard);
        return ctx.scene.leave();
    }
})

export const ProductInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("➕) Add Product", "add_product")],
    [Markup.button.callback("👔) Update Product Details", "update_product")],
    [Markup.button.callback("🚮) Delete Product", "delete_product")],
    [Markup.button.callback("📃) Return to Admin Menu", "return_admin")],
    [Markup.button.callback("📃) Return to Menu", "return")]
]);

export const CategoryInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("➕) Add Category", "add_category")],
    [Markup.button.callback("👔) Update Category Details", "update_category")],
    [Markup.button.callback("🚮) Delete Category", "delete_category")],
    [Markup.button.callback("📃) Return to Admin Menu", "return_admin")],
    [Markup.button.callback("📃) Return to Menu", "return")]
]);

export const AdminInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🎒) Edit Categories Items", 'category')],
    [Markup.button.callback("👔) Edit Product Items", 'product')],
    [Markup.button.callback("📃) Return to Menu", "return")]
]);

export const UpdateProductInlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🎒) Update Category", 'update_product_category')],
    [Markup.button.callback("✏) Update Product Title", 'update_product_title')],
    [Markup.button.callback("🖼) Update Product Image", 'update_product_img')],
    [Markup.button.callback("✏) Update Product Description", 'update_product_description')],
    [Markup.button.callback("🆓) Update Product Price", 'update_product_price')],
    [Markup.button.callback("💹) Update Product Stock", 'update_product_stock')],
    [Markup.button.callback("📃) Return to Admin Menu", "return_admin")],
    [Markup.button.callback("📃) Return to Menu", "return")]
])



export const sendAdminKeyboard = async (ctx, bot) => {
    let replyState = "";
    let updatedCategoryId = "";
    let step = 0;
    let messageId = [];
    changeInlineKeyboard("Hello Owner! What do you want to do today?", ctx, AdminInlineKeyboard);

    bot.action('return', (ctx) => {
        changeInlineKeyboard("This is Our Menu", ctx, menu)
    })

    bot.action('return_admin', (ctx) => {
        changeInlineKeyboard("Hello Owner! What do you want to do today?", ctx, AdminInlineKeyboard);
    })

    bot.action('category', (ctx) => {
        changeInlineKeyboard("What Do you want to do with the Categories of the shop?", ctx, CategoryInlineKeyboard);
    })

    bot.action('add_category', async (ctx) => {
        await ctx.scene.enter("ADD_CATEGORY");
        
    })

    bot.action('update_category',async (ctx) => {
        await ctx.scene.enter("UPDATE_CATEGORY")
    })

    bot.action('delete_category',async (ctx) => {
       await ctx.scene.enter("DELETE_CATEGORY");
    })

    // Product
    bot.action('product', (ctx) => {
        changeInlineKeyboard("What Do you want to do with the Products of the shop?", ctx, ProductInlineKeyboard);
    })

    bot.action('add_product', async (ctx) => {
        await ctx.scene.enter("ADD_PRODUCT");
    });

    bot.action('update_product',async (ctx) => {
        await ctx.scene.enter("UPDATE_PRODUCT");
    })

    bot.action('delete_product',async (ctx) => {
        await ctx.scene.enter("DELETE_PRODUCT");
    })
}