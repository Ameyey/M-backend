import { asyncHandler } from "../utils/asyncHandler.js";
import {AplError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from  '../utils/file_Up_cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const generateAccessAndRefereshTokens = async(userId)=>{
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}
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


   const {accessToken , refershToken } = await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refershToken")

   const options = {
      httpOnly:true,
      secure:true
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refershToken,options)
   .json(
      new ApiResponse(
         200,
         {
            user:loggedInUser,accessToken,refershToken
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
            refershToken:undefined
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

export {
   registerUser,
   loginUser,
   logotUser

}