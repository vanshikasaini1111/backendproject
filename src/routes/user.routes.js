
import {Router} from "express"
import {registerUser} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
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

export default router;


