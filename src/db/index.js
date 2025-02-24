import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
 
const connectDB=async ()=>{
    try{
        console.log("MongoDB Connection String:", process.env.MONGODB_URI);

        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
        console.log(`\n Mongodb connected !! DB HOST:${connectionInstance.connection.host}`);
        
     }catch(error){
         console.error("MONGODB CONNECTION ERROR:",error)
        process.exit(1)
     }
}
export default connectDB