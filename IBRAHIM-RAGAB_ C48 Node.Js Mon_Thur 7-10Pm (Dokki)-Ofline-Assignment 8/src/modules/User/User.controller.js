import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { chickDeleteCachedUser, logout, profile, rotateToken, updateProfile } from "./User.service.js";
import { authentication } from "../../middleware/index.js";
import { logoutEnum, tokenTypeEnum } from "../../common/enum/index.js";
import { fileValidation, localFileUpload, uploadMiddleware } from "../../common/utils/multer/index.js";
const router = Router()

router.get("/", authentication(), async (req, res, next) => {

    const user = await profile(req.user)
    return successResponse({
        res,
        statusCode: 200,
        data: user
    })


})
router.patch("/", authentication(), async (req, res, next) => {
    (req.user);
    const user = await updateProfile(req.user, req.body)
    return successResponse({
        res,
        statusCode: 200,
        data: user
    })


})
router.patch("/profile-image",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload({ maxFileSize: 2 })
            .single("attachment"),
        customPath: "users",
        validation: fileValidation.image
    }),
    async (req, res, next) => {
        req.user.image = req.file.path
        console.log(req.user);
        await req.user.save()
        await chickDeleteCachedUser({user :req.user})
        return successResponse({
            res,
            statusCode: 200,
            data: { file: req.user }
        })


    })

router.post("/rotate-token", authentication(tokenTypeEnum.REFRESH), async (req, res, next) => {
    const data = await rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
    return successResponse({ res, statusCode: 200, data })
})

router.post("/logout", authentication(), async (req, res, next) => {
    // const action = req.body
    const data = await logout(req.payload, req.user, req.body)
        ({ message: req.body.action });

    return successResponse({
        res,
        statusCode: 200,
        message: req.body.action === logoutEnum.ALL
            ? "Logout successful in all devices"
            : "Logout successful in current device",
        data
    })
});

export default router;