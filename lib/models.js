import { DataTypes, Model, Sequelize } from "sequelize";


export const defineModels = (sequelize) => {
    class Product extends Model {}
    class User extends Model {}
    class Category extends Model {} 
    Product.init({
        ID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        categoryId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
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
        ID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
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
        ID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
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

    return {
        Product,
        User,
        Category,
    };
}



export const SynchroniseModels = async (sequelize) => {
    await sequelize.sync({ force: true });
}