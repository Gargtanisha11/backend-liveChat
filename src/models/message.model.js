import mongoose from "mongoose";

const messageSchema= new mongoose.Schema({
    sender:{
        type:new mongoose.Types.ObjectId,
        ref:"user",
        required:true,
    },
    receiver:{
        type:new mongoose.Types.ObjectId,
        ref:"user",
        required:true,      
    },
    content:{
        type:String,
        required:true,
    },
    read_status:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const Message= mongoose.model("Message",messageSchema)