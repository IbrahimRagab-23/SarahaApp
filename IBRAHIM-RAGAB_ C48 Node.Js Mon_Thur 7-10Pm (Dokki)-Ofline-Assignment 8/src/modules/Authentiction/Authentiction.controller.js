import { Router } from "express";
import { succsseResponse } from "../../common/utils/index.js";
import  * as validators from "./Authentiction.validation.js";
import { BadException } from "../../common/exceptions/index.js";
import { login, signup } from "./Authentiction.service.js";

const router = Router();


router.post("/signup", async (req, res, next) => {
      const validationResult=validators.signupZ.safeParse(req.body)
    if (!validationResult.success) {
        throw BadException("Invalid signup credentials", validationResult.error.issues )
    }
    const data = await signup(validationResult.data)
    console.log({ data }, "done ");
    return succsseResponse({
        res,
        statusCode: 201,
        data
    });
});
router.post("/login", async (req, res, next) => {
    const validationResult=validators.loginZ.safeParse(req.body)
    if (!validationResult.success) {
        throw BadException("Invalid login credentials", validationResult.error.issues )
    }
    const data = await login(validationResult.data)
    console.log({ data }, "done ");
     
    
    return succsseResponse({
        message: "Login successful",
        res,
        statusCode: 200,
        data
    });
});


export default router;