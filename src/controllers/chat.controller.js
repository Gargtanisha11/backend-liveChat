// controller create chat , get message List  , add chat list to its participants, delete chat list

import mongoose from "mongoose";
import { Chat } from "../models/chat.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const chatCommonAggregation = () => {
  return [
    // get the participant
    {
      $lookup: {
        from: "users",
        localField: "paticipants",
        foreignField: "_id",
        as: "participants",
        pipeline: {
          project: {
            password: 0,
            refreshToken: 0,
          },
        },
      },
    },
    {
      $lookup: {
        form: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
          {
            $lookup: {
              form: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender",
              pipeline: [
                {
                  project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addField: {
              lastMessage: { $first: "lastMessage" },
            },
          },
        ],
      },
    },
  ];
};
const createOrGetChat = asyncHandler(async (req, res) => {
  // get the sender id  from req.body
  // check if it send by user or not
  // check that is it not same as user id

  const { receiverId } = req.params;
  if (!receiverId) {
    throw new ApiError(401, " can't able to create chat without receiveID ");
  }
  if (req.user?._id.toString() === receiverId) {
    throw new ApiError(401, " not possible to sender and receiver are same");
  }

  // check if there is already any chat with same participants
  const alreadyChat = await Chat.aggregate([
    {
      $match: {
        participants: {
          $elemMatch: {
            $eq: req.user?.id,
          },
        },
        participants: {
          $elemMatch: {
            $eq: new mongoose.Types.ObjectId(),
          },
        },
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (alreadyChat) {
    return res
      .status(200)
      .json(new ApiResponse(200, alreadyChat, " get the chat list "));
  }

   const newChatInstance= await Chat.create({
    participants:[req.user?._id,sender],
   })
  
   const createdChat =await Chat.aggregate([
      {
        $match:{
          _id: newChatInstance?._id
        }
      },
      ...chatCommonAggregation()
   ])

   if(!createdChat){
     throw new ApiError(501, " not able to create chat")
   }


   // emit the chat using socket to other participant  

    return  res.status(200).json( new ApiResponse(200, createdChat," successfully created the chat "));
});


// deleteChat
const deleteChat=asyncHandler(async(req,res)=>{
   // get the chat id 
   // find that chat using find by id 
   // delete that chat id 
   const {chatId}= req.params;
    const payload= await Chat.aggregate([
      {
        match:{
          _id:new mongoose.Types.ObjectId(chatId)
        }
      },
      ...chatCommonAggregation()
    ]);

    if(!payload){
       throw new ApiError(402, " Chat doesn't exist ");
    }
    
    const isDeleted = await Chat.findByIdAndDelete(payload._id);

    return res.status(200).json (new ApiResponse(200, payload, " your chat get deleted "))

    
})
const getAllChats= asyncHandler(async(req,res)=>{


      const {chatId} = req.params;
      if(!chatId){
        throw new ApiError( 403, " not exist a chat of this chat id ")
      }
      
     const payload= await Chat.aggregate([
      {
         $match:{
           participants:{
            $elemMatch:{
               _id:new mongoose.Types.ObjectId(req?.user?._id)
            }
           }
         }
      },
      ...chatCommonAggregation()
      ,
      {
        $sort:{
          createdAt:-1,
        }
      }
     ]);

     if(!payload){
       throw new ApiError(402,"  not any chat ")
     }
      return res.status(200).json( new ApiResponse(200, payload," all chat of the user"));
})

export {createOrGetChat, deleteChat ,getAllChats}