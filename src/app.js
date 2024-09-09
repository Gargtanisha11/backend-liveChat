import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();

console.log(process.env.CORS_ORIGIN);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

// limiter to set the limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // time limit
  max: 500, // maximum number of request within the time limit
  standardHeaders: true, // return rate limit info to ratelimiy header
  legacyHeaders: false, // disable the X-RateLimit-limit header
  keyGenerator: (req, res) => {
    return req.clientIp;
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      ` there are too much request you  are only allowed ${options.max} requests per${options.windowMs / 60000} minutes `
    );
  },
});

app.use(limiter);

import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import { ApiError } from "./utils/ApiError.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);

export { app };
