
import {Router} from "express"
import {registerUser} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
import {loginUser} from "../controllers/user.controllers.js"
import {logOutUser} from "../controllers/user.controllers.js"
import {refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}from "../controllers/user.controllers.js"
import {verifyJWT} from "../middlewares/authentication.middlewares.js"
const router=Router();
console.log("userroutes running");

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1,
        }
    ]),
    registerUser);

    router.route("/login").post(loginUser);
    // using middleware
    router.route("/logout").post(verifyJWT,logOutUser);
    router.route("/refresh-token").post(refreshAccessToken);
    router.route("/change-password").post(verifyJWT,
        changeCurrentPassword);
    router.route("/current-user").get(verifyJWT,
        getCurrentUser);
    router.route("/update-account").patch(verifyJWT,
            updateAccountDetails);
    router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),
             updateUserAvatar);
    router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),
                updateUserCoverImage);
    router.route("/c/:username").get(verifyJWT,
       getUserChannelProfile );  
    router.route("/watchhistory").get(verifyJWT,
    getWatchHistory );            
        
export default router;


