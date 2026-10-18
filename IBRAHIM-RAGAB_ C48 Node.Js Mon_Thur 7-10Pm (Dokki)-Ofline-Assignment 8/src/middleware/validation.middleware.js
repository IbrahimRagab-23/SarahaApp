import { LanguageEnum } from "../common/enum/security.enum.js";
import { BadException } from "../common/exceptions/index.js";



export const validation = (schema) => {
    return async (req, res, next) => {
        const lang = req.headers["accept-language"] ?? LanguageEnum.EN
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            files: req.files,
            file: req.file,
        })
        
        if (!validationResult.success) {
         throw BadException("validationResult Error", validationResult.error.issues)
        }
        req.validate = validationResult.data
        next()
    }
}