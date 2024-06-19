import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectionDB =async()=>{
    try {
      const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
      console.log(`\n MOngo Db connect !! DB hosts: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log( " mongo db connection error",error)
        process.exit(1)
    }
}

export default connectionDB;