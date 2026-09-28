import {  DB_URI } from '../config.js';
import mongoose from "mongoose"
import { UserModel } from './model/User.model.js';


export const bootstrapDB = async (app ,PROT)=> {
try {
     await  mongoose.connect(DB_URI ,{serverSelectionTimeoutMS:5000})
    console.log("DB Connected Successfully 🥭");
    // await UserModel.syncIndexes()
    app.listen(PROT, () => console.log(`Example app listening on port ${PROT}!`))
} catch (error) {
    console.log(error);
    
    console.log('fail to connected DB ☠️');
    
}

}
 