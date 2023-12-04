import { db } from "../index.js";

export const testDatabase = async () => {
    try{
        await db.authenticate();
        return true;
    }catch(err){
        console.log(err);
        return false;
    }
}