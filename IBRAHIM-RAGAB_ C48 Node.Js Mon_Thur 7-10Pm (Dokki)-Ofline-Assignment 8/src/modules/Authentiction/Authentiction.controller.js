import { Router } from "express";
import { succsseResponse } from "../../common/utils/index.js";
import  * as validators from "./Authentiction.validation.js";
import { BadException } from "../../common/exceptions/index.js";
import { login, signup } from "./Authentiction.service.js";

const router = Router();


router.post("/signup", validators.signupZ, async (req, res, next) => {
     
    const data = await signup(req.validate)
    console.log({ data }, "done ");
    return succsseResponse({
        res,
        statusCode: 201,
        data
    });
});
router.post("/login", validators.loginZ, async (req, res, next) => {
   
    const data = await login(req.validate)
    console.log({ data }, "done ");
     
    
    return succsseResponse({
        message: "Login successful",
        res,
        statusCode: 200,
        data
    });
});


export default router;