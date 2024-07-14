import mongoose, { Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    chatList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    avatar: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true}
);

// user schema with following fields (_id, username, fullname, email, avatar,chatlist, password, refreshToken ,createdAt, updatedAt  )
// user methods -> verify password, hash password  using bcrypt , create accesstoken and refreshToken  using jwt

 userSchema.methods.verifyPassword= async function(password){
   return await bcrypt.compare(password,this.password);
 }

 userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();
   this.password=await bcrypt.hash(this.password,10)
   next()
 })

 userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
      _id:this._id,
      userName:this.userName,
      email:this.email
     },
     process.env.ACCESS_TOKEN_SECRET,
     {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
     }
    )
 }

 userSchema.methods.generateRefreshToken=function(){
  return jwt.sign({
    _id:this._id
  },
process.env.REFRESH_TOKEN_SECRET,
{
  expiresIn:process.env.REFRESH_TOKEN_EXPIRY
})
 }

export const User = mongoose.model("User",userSchema);
