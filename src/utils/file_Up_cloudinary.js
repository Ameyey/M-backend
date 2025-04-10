import cloudinary  from "cloudinary";
import {v2 } from "cloudinary"
import fs from 'fs'
   
      cloudinary.config({ 
          cloud_name: process.env.CLOUDINAEY_CLOUD_NAME,  //Cloudi name
          api_key: process.env.CLOUDINAEY_CLOUD_KEY,   //Cloudi key
          api_secret: process.env.CLOUDINAEY_CLOUD_SECRET  // Click 'View API Keys' above to copy your API secret
      });  
        
const uploadOnCloudinary = async function(localFilePath){
 try {
  if(! localFilePath ) return null
  
 const response = await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
  }) 
   // file update been success full
  console.log("File uploaded on cloudinary",response.url);
  return response;

 } catch (error) {
    fs.unlinkSync(localFilePath)  // remove the locall saved templorary file as the upload operation got failed
    return null
 }
}  


export {uploadOnCloudinary}