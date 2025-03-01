import { User } from "../models/user.models";
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
//verify user is there or not
export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken||req.header
        ("Authorization")?.replace("Bearer","")
    
        if(!token){
            throw new apiError(401,"unautorized request")
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apiError(401,"invalid acees token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message||"invalid access token")
        
    }
})