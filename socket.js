import { Server as ServerIO } from "socket.io"


let io;
const userSocketMap = new Map();

const setUpSocket =(server)=>{

    // insatnce of socket io with parameter server and some of the options
    io = new ServerIO(server,{
     cors:{
        origin:process.env.CORS_ORIGIN,
        //methods:[GET,POST],
        credentials:true
     }
   })


   io.on("connection",(socket)=>{

       const userId = socket?.handshake?.query?.userId;
       console.log(" user connected")
       userSocketMap.set(userId,socket.id);

      
      socket.on("message ",(msg)=>{
        console.log(msg)
      })
      socket.on('disconnect',(reason)=>{
        for(const [userId,socketId] of userSocketMap.entries()){
          if(socketId===socket.id){
           // console.log(userId,socketId)
            userSocketMap.delete(userId);
          }
        }
       // console.log(" user disconnected reason is ",reason)
     })
   // console.log( socket);
   })
}

const emitSocketEvent =(userId,eventName,message)=>{
  if(userSocketMap.get(userId)){
  io.to(userSocketMap.get(userId)).emit(eventName,message);
  }
}



export {emitSocketEvent}

export default setUpSocket