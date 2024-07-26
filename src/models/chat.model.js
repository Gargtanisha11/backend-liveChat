import mongoose from "mongoose"

const chatSchema = new mongoose.Schema({
    participants:[
        {
            type:new mongoose.Types.ObjectId,
            ref:"User"
        }
    ],
    message:[
        {
            type:new mongoose.Types.ObjectId,
            ref:'Message'
        }
    ],
    lastMessage:{
       type: new mongoose.Types.ObjectId,
       ref:"Message"
    }
    
    
},{timestamps:true}) 

export const Chat = mongoose.model(chatSchema,"Chat");