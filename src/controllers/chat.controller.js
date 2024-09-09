// controller create chat , get message List  , add chat list to its participants, delete chat list

import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
 
const chatCommonAggregation = () => {
  return [
    // get the participant
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              as: "sender",
              pipeline: [
              
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "receiver",
              foreignField: "_id",
              as: "receiver",
              pipeline: [
                {
                  $addFields:{
                    receiver:{
                      $first:"$receiver"
                    }
                  }
                },
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields:{
              sender:{
                $first:"$sender"
              },
              receiver:{
                $first:"$receiver"
              }
            }
          },
        ],
      },
    },
    {
       $addFields:{
        lastMessage:{
          $first:"$lastMessage"
        }
       }
    }
    
  ];
};
const createOrGetChat = asyncHandler(async (req, res) => {
  // get the sender id  from req.body
  // check if it send by user or not
  // check that is it not same as user id

  const { receiverId } = req.params;

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(401, "  wrong receiver id ");
  }
  if (req.user?._id.toString() === receiverId) {
    throw new ApiError(401, " not possible to sender and receiver are same");
  }

  // check if there is already any chat with same participants
  const alreadyChat = await Chat.aggregate([
    {
      $match: {
        participants: {
          $all: [
            new mongoose.Types.ObjectId(receiverId),
            new mongoose.Types.ObjectId(req?.user?._id),
          ],
        },
      },
    },

    ...chatCommonAggregation(),
  ]);

  if (alreadyChat.length != 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, alreadyChat, " get the chat list "));
  }

  const newChatInstance = await Chat.create({
    participants: [req.user?._id, receiverId],
  });

  const createdChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(newChatInstance?._id),
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!createdChat) {
    throw new ApiError(501, " not able to create chat");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      chatList: newChatInstance?._id,
    },
  });

  await User.findByIdAndUpdate(receiverId, {
    $push: {
      chatList: newChatInstance?._id,
    },
  });

  // emit the chat using socket to other participant

  return res
    .status(200)
    .json(new ApiResponse(200, createdChat, " successfully created the chat "));
});

// deleteChat
const deleteChat = asyncHandler(async (req, res) => {
  // get the chat id
  // find that chat using find by id
  // delete that chat id
  const { chatId } = req.params;

  const payload = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (payload.length == 0) {
    throw new ApiError(402, " Chat doesn't exist ");
  }

  await Message.deleteMany({
    chat: chatId,
  });

  const isDeleted = await Chat.findByIdAndDelete(chatId);

  // delete chat ids from chatlist of user
  payload[0]?.participants.map(async (part) => {
    const result = await User.findByIdAndUpdate(
      part?._id,
      {
        $pull: {
          chatList: chatId,
        },
      },
      { new: true }
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, payload, " your chat get deleted "));
});

const getAllChats = asyncHandler(async (req, res) => {
  const payload = await Chat.aggregate([
    {
      $match: {
        participants: {
          $in: [new mongoose.Types.ObjectId(req?.user?._id)],
        },
      },
    },
    ...chatCommonAggregation(),
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (!payload) {
    throw new ApiError(402, "  not any chat ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, payload, " all chat of the user"));
});

export { createOrGetChat, deleteChat, getAllChats };
