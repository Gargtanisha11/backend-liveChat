// send a message
// delete the message
// get all message

import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Message } from "../models/message.model.js";
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
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
        from: "User",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "receiver",
        foreignField: "_id",
        as: "receiver",
      },
    },
    {
      $project: {
        conetnt: 1,
        sender: {
          name: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
        },
        receiver: {
          name: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
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

  if (!selectedChatId?.participants.include(req?.user?.id)) {
    throw new ApiError(401, " user is not the participant of this chat ");
  }

  const payload = await Chat.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatMessageCommonAggregate(),
  ]);

  if (!payload) {
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

  if (!message?.sender.equals(req.user)) {
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
        _id: messageId,
      },
    },
    ...chatMessageCommonAggregate(),
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
   const {senderId,chatId} = req.params;
   
   const {content} = req.body;
   
   if(!content){
     throw new ApiError(403, " content is required ");
   }

   const sender = await User.findById(senderId)
   if(!sender){
     throw new ApiError(403 ," sender id is not the valid id");
   }

   const chat = await Chat.findById(chatId);
   if(!chat){
     throw new ApiError(403, " chat id is not valid ")
   }
 

    if(!chat.partcipants.include(req?.user._id) || !chat.partcipants.include(senderId)){
       throw new ApiError(402," receiver or sender are the not the participants ")
    }


    const createdMessage= await Message.create({
      sender:senderId,
      receiver:req?.user?._id,
      content:content,
      chat:chatId,
    });


  
   await Chat.findByIdAndUpdate(chatId,{
    $push:{
      message:createdMessage?._id
    }
   })

   return res.status(200).json(new ApiResponse(200,createdMessage," message send successfully "))
})
export { getAllMessage ,deleteMessage,sendMessage}
