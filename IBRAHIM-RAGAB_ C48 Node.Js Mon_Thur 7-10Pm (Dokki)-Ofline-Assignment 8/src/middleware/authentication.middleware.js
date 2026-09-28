import { tokenTypeEnum } from "../common/enum/index.js"
import { UnauthorizedException } from "../common/exceptions/index.js"
import { deCodeToken } from "../common/security/index.js"

export const authentication = (tokenType = tokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers
        if (!authorization) {
            throw UnauthorizedException("Unauthorized Account")
        }
        const { user, payload } = await deCodeToken({ authorization, tokenType })
        req.user = user
        req.payload = payload
        next()

    }
}
export const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (!req.user  < accessRole) {
            throw ForbiddenException("Forbidden Account")
        }
        next()

    }
}