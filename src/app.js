import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app =express();

app.use(cors(
   {
      origin:process.env.CORS_ORIGIN,
      credentials:true
   }
))

app.use(cookieParser());

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb",
}))

app.use(express.static("public"))


import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";


// app.use("/api/v1/user/register",async(req,res)=>{
//     console.log(req.body);
//     return res.status(200);

// })
app.use("/api/v1/user",userRouter);
app.use("/api/v1/chat",chatRouter);
app.use("/api/v1/message",messageRouter);

export {app}