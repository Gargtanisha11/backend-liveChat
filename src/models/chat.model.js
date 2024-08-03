import mongoose, { Schema } from "mongoose"

const chatSchema = new mongoose.Schema({
    participants:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    message:[
        {
            type:Schema.Types.ObjectId,
            ref:'Message'
        }
    ],
    lastMessage:{
       type: Schema.Types.ObjectId,
       ref:"Message"
    }
    
    
},{timestamps:true}) 

export const Chat = mongoose.model("Chat",chatSchema);