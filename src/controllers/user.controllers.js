import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User} from "../models/user.models.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js"
import{apiResponse} from "../utils/apiResponse.js"


const registerUser = asyncHandler( async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // }
    // );
    console.log("request aa gyi")


    //get user details from frontend

    const {fullName,email,username,password}=req.body
        // console.log("email:",email);


     //validation - not empty
          if([fullName,email,username,,password].some((field)=>
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
    const coverImage=await uploadOnCloudinary(coverImageLocalPathocalPath)
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
    const createdUser=await User.findById(user,_id).select("-password -refreshToken")
    // - me jo field nhi chahiye 

    if(!createdUser){
        throw new apiError(500,"Something went wrong while registering user");
    }

    //return res using apiResponse

    return res.status(201).json({
        new apiResponse(200,createdUser,"User registered successfully")
    })


});

export {registerUser};

