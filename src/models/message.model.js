import mongoose, { Schema } from "mongoose";

const messageSchema= new mongoose.Schema({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    receiver:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,      
    },
    content:{
        type:String,
        required:true,
    },
    
    chat:{
     type:Schema.Types.ObjectId,
     required: true,
     
    },
    read_status:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const Message= mongoose.model("Message",messageSchema)