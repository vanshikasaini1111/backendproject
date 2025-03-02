import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User} from "../models/user.models.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";
// User for mongodb data

//user is object of req data

//this function generates token using userId and save in db
const generateAccessAndRefreshTokens=async(userId)=>{
  try{
      const user=await User.findById(userId);
      const accessToken=user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()

      //to save in database so that password is not req every time

      user.refreshToken=refreshToken
      await user.save({validateBeforeSave:false})//no other fields req to save this
      return {accessToken,refreshToken};
  }catch(error){
    throw new apiError(500,"Something went wrong while generating tokens")
  }
}

const registerUser = asyncHandler( async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // }
    // );

    //get user details from frontend

    const {fullName,email,username,password}=req.body
        // console.log("email:",email);


     //validation - not empty
          if([fullName,email,username,password].some((field)=>
        field?.trim()=="")){
            throw new apiError(400,"all fields are required")
          }
//check is user already exisits:username email
          const existedUser= await User.findOne({
            $or:[{username},{email}]
          })
          if(existedUser){
            throw new apiError(409,"user with email or username already existed")
          }

    
    //check for images,check for avatar

   const avatarLocalPath= req.files?.avatar[0]?.path;
   //const coverImageLocalPath= req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.
    coverImage) && req.files.coverImage.length>0){
      coverImageLocalPath=req.files?.coverImage[0]?.path;
   }
   if(!avatarLocalPath){
    throw new apiError(400,"avatar is required");
   }
    //upload them to cloudinary,avatar check
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new apiError(400,"avatar is required");
    }

    //create user object for mongodb - create entry in db

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    //remove password and refresh token field from response
    //check for user creation
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    // - me jo field nhi chahiye 

    if(!createdUser){
        throw new apiError(500,"Something went wrong while registering user");
    }

    //return res using apiResponse

    return res.status(201).json( new apiResponse(200,createdUser,"User registered successfully")
    )


});

const loginUser =asyncHandler(async(req,res)=>{
   //req body ->data

   const {email,username,password} =req.body

   // username or email

   if(!(username || email)){
    throw new apiError(400,"username or email is required")
   }
   // find the user

   const user=await User.findOne({
    $or: [{username},{email}]
   })

   if(!user){
    throw new apiError(404,"user does not exist")
   }
   //password check
   const isPasswordvalid=await user.isPasswordCorrect(password)
   //we will get a true or false value from this
   if(!isPasswordvalid){
    throw new apiError(401,"invalid user credentials")
   }

  
   //access and refresh token must be generated, putting in method
   //because we are going to use this multiple times

   const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
   // send cookie i.e which info you send to user

   const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
// these cookies can only be modified by server
   const options={
    httpOnly:true,
    secure:true
   }

   return res.status(200)
   .cookie("accesToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new apiResponse(200,{user:loggedInUser,accessToken,refreshToken},
      "User logged in succesfully "
    )
   )
   



})

const logOutUser=asyncHandler(async(req,res)=>{
 
  // have to clear cookies and tokens 
  await User.findByIdAndUpdate(
    req.user._id,//middleware returned user
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiResponse(200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.
  refreshToken||req.body.refreshToken

  if(!incomingRefreshToken){
    throw new apiError(401,"unauthorized request")
  }

 try {
   const decodedToken=jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
   const user=await User.findById(decodedToken?._id)
   if(!user){
     throw new apiError(401,"invalid refresh token")
   }
 
   if(incomingRefreshToken!== user?.refreshToken){
     throw new apiError(401,"refresh token is expired")
   }
 
  const {accessToken,newrefreshToken}= await generateAccessAndRefreshTokens(user._id)
   const options={
     httpOnly:true,
     secure:true
    }
 
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{accessToken,refreshToken:newrefreshToken},"access token refreshed successfully"))
 
 } catch (error) {
  throw new apiError(401,error?.message||"Invalid refresh token")
  
 }


})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
   const {oldPassword,newPassword}=req.body 
   const user=await User.findById(req.user?._id)
   const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
    throw new apiError(400,"invalid old password")
   }
   user.password=newPassword
   await user.save({validateBeforeSave:false})
   return res.status(200)
   .json (new apiResponse(200,{},"Password changes successfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body
    if(!(fullName||email)){
      throw new apiError(400,"All fields are required")
    }

    const user=await  User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          fullName,
          email:email
        }
      },
      {new:true}//return info after update
    ).select("-password")
    return res.status(200)
    .json(new apiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar=asyncHandler (async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    throw new apiError(400,"avatar is required")
  }
  const avatar=await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new apiError(400,"error while uploading on avatar")
  }
  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },{new:true}
  ).select("-password")

  return res.status(200)
    .json(new apiResponse(200,user,"Avatar updated successfully"))

})

const updateUserCoverImage=asyncHandler (async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){
    throw new apiError(400,"cover image is required")
  }
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new apiError(400,"error while uploading cover image")
  }
  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },{new:true}
  ).select("-password")

  return res.status(200)
    .json(new apiResponse(200,user,"cover image updated successfully"))

})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};

