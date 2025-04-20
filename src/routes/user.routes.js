import {Router} from "express";
import  { loginUser, logotUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updataAccountDetails, updataUserAvatar, updataUserCoverImage }  from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";



const router  = Router()

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },
    {
       name:"coverImage",
       maxCount:1
    },
    
  ]),
  registerUser
)


router.route("/login").post(loginUser)

//secured route 

router.route("/logout").post(verifyJWT , logotUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password")/post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updataAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updataUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updataUserCoverImage)




export default  router