import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { getPublicIdFromFilePath } from "./helperFunction.js"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath){
            return null
        }
        const response= await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"});
        fs.unlinkSync(localFilePath);

       return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return error
    }
}

const deleteFromCloudinary=async(fileUrl)=>{
    try {
        // get the public id from local file path with the use of function 
        // delete it using delete method of cloudinary
        // return the response
        if(!fileUrl) return null 
         const publicId= getPublicIdFromFilePath(fileUrl);
         const response = await cloudinary.uploader.destroy(publicId);
         return response 

    } catch (error) {
        return error 
    }
}
export {uploadOnCloudinary,deleteFromCloudinary}