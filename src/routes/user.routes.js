
import {Router} from "express"
import {registerUser} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
import {loginUser} from "../controllers/user.controllers.js"
import {logOutUser} from "../controllers/user.controllers.js"
import {refreshAccessToken}from "../controllers/user.controllers.js"
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
export default router;


