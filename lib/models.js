import { DataTypes, Model, Sequelize } from "sequelize";


export const defineModels = (sequelize) => {
    class Product extends Model {}
    class User extends Model {}
    class Category extends Model {} 
    class CartItems extends Model {}
    class Order extends Model {}

    Product.init({
        title: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        img: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        price: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }, 
        stock: {
            type: DataTypes.STRING,
            defaultValue: 0,
        },
    }, {
        sequelize,
        modelName: "Products"
    })
    
    User.init({
        UserID: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        UserName: {
            type: DataTypes.STRING,
            defaultValue: "",
        }
    }, {
        sequelize
    })
    
    Category.init({
        Name: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        ItemCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    }, {
        sequelize
    })
    
    Category.hasMany(Product);
    Product.belongsTo(Category);

    CartItems.init({
        Quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },

        Price: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    }, {
        sequelize,
        modelName: "CartItems"
    })

    Product.hasMany(CartItems)
    User.hasMany(CartItems)

    CartItems.belongsTo(Product)
    CartItems.belongsTo(User)

    Order.init({
        
    }, {
        sequelize,
        modelName: "Order"
    })

    User.hasMany(Order)
    Order.belongsTo(User)

    return {
        Product,
        User,
        Category,
        CartItems,
        Order
    };
}



export const SynchroniseModels = async (sequelize) => {
    await sequelize.sync({ alter: true });
}