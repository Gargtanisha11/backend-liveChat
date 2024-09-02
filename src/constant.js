export const DB_NAME ="live-chat-app"
export const option={
    httpOnly:true,
    secure: true,
    expires: new Date(Date.now() + 24*60*60*1000),
    
}
export const CHAT_EVENT_NUM= {
    RECEIVE_MSG:"receiveMSg"
}