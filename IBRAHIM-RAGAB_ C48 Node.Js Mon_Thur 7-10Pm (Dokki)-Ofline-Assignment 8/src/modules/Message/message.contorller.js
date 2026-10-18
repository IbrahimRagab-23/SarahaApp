import Router from "express"
import { fileValidation, localFileUpload, successResponse, uploadMiddleware } from './../../common/utils/index.js';
import { createMessage, deleteMessage, getAllMessages, getMessage, createRequestIdentity } from "./message.service.js";
import { validation } from './../../middleware/validation.middleware.js';
import * as validators from "./message.validation.js"
import { authDecodeToken, authentication } from "../../middleware/authentication.middleware.js";
const router = Router()
const messageFolderName = "messages"
router.post("/",
    async (req, res, next) => {
        if (req.headers["authorization"]) {
            const { authorization } = req.headers
            await authDecodeToken({ req, authorization })
        }
        next()
    }
    ,
    uploadMiddleware({
        multerMiddleware: localFileUpload().any("attachments", 3),
        validation: fileValidation.image,
        customPath: messageFolderName,
        isRequired: false
    }), validation(validators.createMessage), async (req, res, next) => {
        const data = await createMessage(req.body, req.files, req.user);

        return successResponse({
            res,
            statusCode: 201,
            data
        })
    })


router.get("/", authentication(), validation(validators.allMessages), async (req, res, next) => {
    const data = await getAllMessages(req.validate.query, req.user)

    return successResponse({
        res,
        statusCode: 200,
        data
    })
})
router.delete("/:messageId", authentication()
    , validation(validators.deleteMessage),
    async (req, res, next) => {

        const data = await deleteMessage(req.validate.params, req.user)

        return successResponse({
            res,
            statusCode: 200,
            data
        })
    })
router.get("/:messageId", authentication()
    , validation(validators.deleteMessage),
    async (req, res, next) => {

        const data = await getMessage(req.validate.params, req.user)

        return successResponse({
            res,
            statusCode: 200,
            data
        })
    })
router.post("/:messageId", authentication()
    , validation(validators.deleteMessage),
    async (req, res, next) => {

        const data = await getMessage(req.validate.params, req.user)

        return successResponse({
            res,
            statusCode: 200,
            data
        })
    })

router.post("/:messageId/whoAreYou", authentication(),
    validation(validators.deleteMessage),
    async (req, res, next) => {
        console.log(req.validate.params, req.user);
        
        const data = await createRequestIdentity(req.validate.params, req.user)
        return successResponse({
            res,
            statusCode: 200,
            data
        })
    })



export default router