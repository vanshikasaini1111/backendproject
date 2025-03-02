import mongoose,{Schema} from "mongoose";
const subscriptionSchema=new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    //channel is also an object
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const Subscription=mongoose.model("Subscription",su)