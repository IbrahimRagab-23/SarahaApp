import { Router } from "express";
import { generatelimiter, successResponse } from "../../common/utils/index.js";
import { resendConfirmEmail, confirmEmail, login, signup, signupWithGmail, requestForgotPassword, verifyForgotPassword, resetForgotPassword } from "./Authentiction.service.js";
import * as validators from "./Authentiction.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { del } from "../../common/services/index.js";

const router = Router();

router.post("/signup", validation(validators.signup), async (req, res, next) => {

    const data = await signup(req.validate.body)

    return successResponse({
        res,
        statusCode: 201,
        data
    });
});

router.patch("/confirm-email", validation(validators.confirmEmail), async (req, res, next) => {

    const data = await confirmEmail(req.validate.body)

    return successResponse({
        res,
        statusCode: 201
    });
});

router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail), async (req, res, next) => {

    const data = await resendConfirmEmail(req.validate.body)

    return successResponse({
        res,
        statusCode: 201,
        data
    });
});
const loginlimiter = generatelimiter({ limit: 5, ttl: 5 , skipSuccessfulRequests:true})
router.post("/login", loginlimiter, validation(validators.login), async (req, res, next) => {

    const data = await login(req.validate.body, `${req.protocol}://${req.host}`)

    await del({ key: req.rateLimit.key })
    return successResponse({
        message: "Login successful",
        res,
        statusCode: 200,
        data
    });
});

router.post("/request-forgot-password", validation(validators.resendConfirmEmail), async (req, res, next) => {
    const data = await requestForgotPassword(req.validate.body, `${req.protocol}://${req.host}`)
    return successResponse({
        message: "Login successful",
        res,
        statusCode: 201,
        data
    });
});


router.post("/verify-forgot-password", validation(validators.confirmEmail), async (req, res, next) => {

    const data = await verifyForgotPassword(req.validate.body)

    return successResponse({
        res,
        statusCode: 201,
        data
    });
});

router.post("/reset-forgot-password", validation(validators.resetForgotPassword), async (req, res, next) => {
    const data = await resetForgotPassword(req.validate.body)
    return successResponse({
        res,
        statusCode: 201,
        data
    });
});



router.post("/signup-with-gmail", validation(validators.signupWithGmail), async (req, res, next) => {

    const { status, data } = await signupWithGmail(req.validate.body, `${req.protocol}://${req.host}`)
    return successResponse({
        res,
        statusCode: status,
        data
    });
})



export default router;