import { Router } from "express";
import { succsseResponse } from "../../common/utils/index.js";
import { profile, rotateToken, updateProfile } from "./User.service.js";
import { authentication } from "../../middleware/index.js";
import { tokenTypeEnum } from "../../common/enum/index.js";
const router = Router()
router.get("/", authentication() ,async (req, res, next) => {
    console.log(req.user);
    
   const user = await profile(req.user)
   return succsseResponse({
    res,
    statusCode: 200,
    data: user
})


})
router.patch("/", authentication() ,async (req, res, next) => {
    console.log(req.user);
   const user = await updateProfile(req.user , req.body)
   return succsseResponse({
    res,
    statusCode: 200,
    data: user
})


})

router.post("/rotate-token", authentication(tokenTypeEnum.REFRESH) ,async (req, res, next) => {    
   const data = await rotateToken(req.payload,req.user )
   return succsseResponse({
    res,
    statusCode: 200,
    data: data
})})

export default router;