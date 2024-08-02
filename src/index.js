import dotenv from "dotenv"
import connectionDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:'./env'
})

connectionDB() // build the connection 
.then(()=>{
    app.on("error",(error)=>{
        console.log(error)
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log( `server is runing on the port :: ${process.env.PORT}`)
    })
})
.catch((err)=>console.log(err))