import jwt from 'jsonwebtoken'
import { asyncHandler } from "../utils/asyncHandler.js";
import {AplError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from  '../utils/file_Up_cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import mongoose from 'mongoose';

const generateAccessAndRefereshTokens = async(userId)=>{
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      

      user.refershToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken,refreshToken}

   } catch (error){      
      throw new AplError(500 ," Something went wrong while generating referesh and access Token ")
   }
}

const registerUser = asyncHandler( async (req,res)=>{
   // get user details from frontend 
   // vaildation - not empty
   // check if user  already exists :username , email
   // check of image,check for avatar
   // upload the to cloudinary, avatar 
   // create user object - create entry in db 
   // remove password and refresh token field from  response
   // check for user creation
   // return res 
   const {username , email , fullName , password }= req.body
   // console.log("email",email );
   if(
    [fullName,email,fullName,password].some((field)=>
    field?.trim() === "")
   ){
    throw new AplError(400, "All fields are required ")
   }
   const existedUser = await User.findOne({
    $or:[{ username },{ email }]
   })
  
   if(existedUser){
      throw new AplError(409,"User with email or username already exists ")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
      throw new AplError(400,"Avatar file is required ")
   }

   const avatar =  await uploadOnCloudinary(avatarLocalPath);
   const coverImage =  await uploadOnCloudinary(coverImageLocalPath); 

   if(!avatar){
      throw new AplError(400,"Avatar file is required ")
   }
   
   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage:coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase()
   })

   const createdUser =  await User.findById(user._id).select("-password -refershToken");


   if(!createdUser){
      throw new AplError(500,"Something went wrong while registering User ..")
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,"User registered Successfully ...")
   )
 
} )


const loginUser = asyncHandler(async(req,res)=>{
   // req body - > data
   // username or  email 
   // find the user
   // password check 
   // access and referesh token 
   // send cookie 
   const {username,email,password} =req.body

   if(!username && !email){
      throw new AplError(400,"User or email is required ")
   }

 


   const user = await User.findOne({
      $or:[{username}, {email}]
   })

   if(!user){
      throw new AplError(404,"User does not exist")
   }

   const isPasswordVaild = await user.isPasswordCorrect(password)

   if(!isPasswordVaild){
      throw new AplError(401 ," Invalid user credentials ")
   }


   const {accessToken , refreshToken} = await generateAccessAndRefereshTokens(user._id)

  

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly:true,
      secure:true
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new ApiResponse(
         200,
         {
            user:loggedInUser,accessToken,refreshToken
         },
         "User logged In Successfully "
      )
   )

})


const logotUser = asyncHandler(async (req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      },
      {
         new:true
      }
   ) 

   const options = {
      httpOnly:true,
      secure:true
   }

   return res.status(200)
   .clearCookie("accessToken",options )
   .clearCookie("refreshToken",options)
   .json(
      new ApiResponse(200, {} ,"User logged Out ")
   )

})

const refreshAccessToken = asyncHandler (async (req,res)=>{
   const incomingRefreshToken =  req.cookie.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new AplError(401,"Unauthorized request ")
   }

 try {
   const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
  
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new AplError(401,"Invalid refresh token")
   }
   
   if(incomingRefreshToken !== user?.refershToken ){
     throw new AplError(401 , "Refersh Token is expird or Used ")
   }
  
   const options={
     httpOnly:true,
     secure:true
   }
  
   const {accessToken, newRefershToken}=  await generateAccessAndRefereshTokens(user._id) 
  
   return res
   .status(200)
   .cookie("accessToken",accessToken ,options)
   .cookie("refershToken",newRefershToken , options)
   .json(
      new ApiResponse(200,
         req.user,
         "User fetched Successfully"

      )
   )
  
 } catch (error) {
   throw new AplError(401 ,error?.message || "Invalid refresh token ")
 }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
   const {oldPassword , newPassword } = req.body;
 
  

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new AplError(400 , "Invalid old Password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})
 

   return res
   .status(200)
   .json(new ApiResponse(200, {} ," Password Changed Successfully "))
})

const getCurrentUser = asyncHandler(async( req,res)=>{
   return res.status(200)
   .json(200,req.user , "Current User fetched successfully")
})

const updataAccountDetails = asyncHandler(async(req,res)=>{
   const { fullName , email } = req.body

   if(!fullName || ! email){
      throw new AplError(400, "All fields  are required ")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      { 
         $set:{
            fullName : fullName,
            email: email
         }
      },
      {new : true}
   ).select("-password")

   return res.status(200)
   .json(new ApiResponse(200,user, "Account details updatad Successfully "))

})

const updataUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath =  req.file?.path

  if(!avatarLocalPath){
   throw new AplError(400 , "Avatar file is missing ")
  }

  const avatar= await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
   throw new AplError(400 , "Error while uploading on Avatar ")
  }

  const user = await User.findByIdAndUpdate(
   req.user?._id ,
   {
      $set:{
         avatar:avatar.url
      }
   },
   {new :true}

  ).select("-password")

  return res.status(200)
  .json(
     new ApiResponse(200,user,"Avatar image Updata Successfully")
  )


})


const updataUserCoverImage = asyncHandler(async(req,res)=>{
   const CoverImageLocalPath =  req.file?.path
 
   if(!CoverImageLocalPath){
    throw new AplError(400 , "Cover Image file is missing ")
   }
 
   const coverImage= await uploadOnCloudinary(CoverImageLocalPath)
 
   if(!coverImage.url){
    throw new AplError(400 , "Error while uploading on Avatar ")
   }
 
   const user = await User.findByIdAndUpdate(
    req.user?._id ,
    {
       $set:{
         coverImage:coverImage.url
       }
    },
    {new :true} 
   ).select("-password")

   return res.status(200)
   .json(
      new ApiResponse(200,user,"Cover image Updata Successfully")
   )
 
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
   
   const {username} = req.params

   if(!username?.trim()){
      throw new AplError(400,"Username is Missing")
   }

   const channel = await User.aggregate([
      {
         $match:{
            username:username?.toLowerCase()
         }
      },
      {
         $lookup:{
            form:"subscriptions", //subscriptions
            localField:"_id",
            foreignField:"channel", //channel
            as:"subscribers"
         }
      },
      {
         $lookup:{
            form:"subscriptions", //subscriptions
            localField:"_id",
            foreignField:"subscribar",
            as:"subscribedTo"
         }
      },
      {
         $addFields:{
            subscribersCount:{
               $size:"$subscribers"
            },
            channelsSubscribedToCount:{
               $size:"$subscribedTo"
            },
            isSubscribed:{
               $cond: {
                  if:{$in: [req.user?._id,"$subscribers.subscribar"]},
                  then:true,
                  else:false
                  
               }
            }
         }
      },
      {
         $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1,

         }
      }
    ])

    if(!channel.length){
      throw new AplError(404 ,"Channel does not Exists")
    }

    return res.status(200)
    .json(
      new ApiResponse(200, channel[0],"User Channel fetched successfully")
    )
})

const getWatchHistory  = asyncHandler(async(req,res)=>{
 const user = await User.aggregate([
   {
      $match:{
         _id:new mongoose.Types.ObjectId(req.user._id)
      }
   },
   {
      $lookup:{
         from:"Video",
         localField:"watchHistory",
         foreignField:"_id",
         as:"watchHistory",
         pipeline:[
            {
               $lookup:{
                  from:"users",
                  localField:"owner",
                  foreignField:"_id",
                  as:"owner",
                  pipeline:[
                     {
                        $project:{
                           fullName:1,
                           username:1,
                           avatar:1
                        }
                     }
                  ]              
               }
            },
            {
               $addFields:{
                  owner:{
                     $first:"$owner"
                  }
               }
            }
         ]
      }
   }
 ])

 return res.status(200)
 .json(
   new ApiResponse(200,user[0].watchHistory,
      "Watch History fetched successFully"            
   )
 )
})

export {
   registerUser,
   loginUser,
   logotUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updataAccountDetails,
   updataUserAvatar,
   updataUserCoverImage,
   getUserChannelProfile ,
   getWatchHistory
}