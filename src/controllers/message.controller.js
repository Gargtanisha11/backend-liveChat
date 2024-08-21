// send a message
// delete the messageś
// get all message

import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Message } from "../models/message.model.js";
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
 // hello 
/**
 * @description Utility function to get the pipeline which used commonly in every function
 * @return {mongoose.PiplelineStage[]}
 */
const chatMessageCommonAggregate = () => {
  /*message  
       {
        content :{  }
        sender:{
         name:,
         fullName,
         avatar,
        }
        receiver:{
         name,
         fullName,
         avatar,
        }
        readStatus,
   }  
         
    */
  return [
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "_id",
        as: "receiver",
      },
    },
    {
      $addFields:{
        sender:{$first:"$sender"}
      }
    },
    {
      $addFields:{
       receiver: { $first:"$receiver"}
      }
    }
    ,
    {
      $project: {
        content: 1,
        sender: {
          name: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
          _id:1
        },
        receiver: {
          name: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
          _id:1
        },
        readStatus: 1,
        creadtedAt: 1,
        updatedAt: 1,
      },
    },
  ];
};

// get the all messages of a particular chat
const getAllMessage = asyncHandler(async (req, res) => {
  // get the chat id
  // aggregate the pipeline to get message of that chat id
  const { chatId } = req.params;

  const selectedChatId = await Chat.findById(chatId);

  if (!selectedChatId) {
    throw new ApiError(402, " not exist chat ");
  }

  if (!selectedChatId?.participants.includes(req?.user?.id)) {
    throw new ApiError(401, " user is not the participant of this chat ");
  }

  const payload = await Message.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
      },
    },
    {
      $lookup:{
        from :"messages",
        localField:"messages",
        foreignField:"_id",
        as:"messages"
      },
      
    },
    ...chatMessageCommonAggregate(),
  ]);

  if (!payload.length) {
    throw new ApiError(402, "not exist the chat ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, payload, " all the message of particular message")
    );
});

const deleteMessage = asyncHandler(async (req, res) => {
  // get the message id and chat id
  // check if it the message id or not and remove the message  from chat also
  // delete   the message
  // return the message to user
  const { chatId, messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(402, " message id is not valid ");
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(402, " chat id is not  valid ");
  }

  if (!message?.sender.equals(req.user._id)) {
    throw new ApiError(
      402,
      "  user is not the sender can't delete the message"
    );
  }

  await Chat.findByIdAndUpdate(chatId, {
    $pull: {
      message: messageId,
    },
  });
  
  const deletedMessage = await Message.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(messageId),
      },
    },
    ...chatMessageCommonAggregate(), // Ensure this function call returns an array
  ]);
  
  
  await Message.findByIdAndDelete(messageId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedMessage, " successfully deleted the message ")
    );
});


const sendMessage=asyncHandler(async(req,res)=>{
   // get the sender id and receiver id and content from the user 
   const {receiverId,chatId} = req.params;
   
   const {content} = req.body;
   
   if(!content){
     throw new ApiError(403, " content is required ");
   }

   const receiver = await User.findById(receiverId)
   if(!receiver){
     throw new ApiError(403 ," receiver id is not the valid id");
   }

   const chat = await Chat.findById(chatId);
   if(!chat){
     throw new ApiError(403, " chat id is not valid ")
   }
   
   if(req?.user?._id.toString()==receiverId){
    throw new ApiError(403, " sender and recievr can't be same ")
   }
    
    if(!chat?.participants.includes(req?.user._id) || !chat?.participants.includes(receiverId)){
       throw new ApiError(402," receiver or sender are the not the participants ")
    }


    const createdMessage= await Message.create({
      receiver:receiverId,
      sender:req?.user?._id,
      content:content,
      chat:chatId,
    });


  
   await Chat.findByIdAndUpdate(chatId,{
    $push:{
      message:createdMessage?._id
    },
    $set:{
      lastMessage:createdMessage?.id
    }
   })

   const messageOutput = await Message.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(createdMessage._id)
      }
    },
    ...chatMessageCommonAggregate()
   ])

   console.log(messageOutput)
   return res.status(200).json(new ApiResponse(200,messageOutput," message send successfully "))
})
export { getAllMessage ,deleteMessage,sendMessage}
