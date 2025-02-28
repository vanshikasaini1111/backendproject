import {asyncHandler} from "../utils/asyncHandler.js";

// const registerUser = asyncHandler( async(req,res)=>{
//     res.status(200).json({
//         message:"ok"
//     });
// });

// export {registerUser};

const registerUser = asyncHandler(async (req, res) => {
    console.log("Incoming Request Data:", req.body); // Debugging line
    res.status(200).json({
        message: "ok"
    });
});

export {registerUser};