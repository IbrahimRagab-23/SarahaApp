import jwt from 'jsonwebtoken';
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRATION, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRATION, REFRESH_USER_TOKEN_SIGNATURE } from './../../config.js';
import { BadException, NotfoundException, UnauthorizedException } from '../exceptions/index.js';
import { findById } from '../repository/index.js';
import { UserModel } from './../../DB/model/index.js';
import { RoleEnum, tokenTypeEnum } from '../enum/index.js';
import { randomUUID } from "node:crypto"
import { exist } from '../services/index.js';
import { set } from './../services/index.js';
export const userBaseRevokeTokenKey = ({ userId }) => {
    return `User::${userId.toString()}::Revoke_Token`
}
export const userRevokeTokenKey = ({ userId, jti }) => {
    return `${userBaseRevokeTokenKey({ userId })}::${jti}`
}
export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options);
}


export const verifyToken = async ({
    payload = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(payload, secret);
}


const gotTokenSignatures = async ({
    role = RoleEnum.USER
} = {}) => {

    let signature;

    switch (role) {

        case RoleEnum.ADMIN:
            signature = {
                accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
                refreshSignatrue: REFRESH_ADMIN_TOKEN_SIGNATURE
            }
            break;

        default:
            signature = {
                accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
                refreshSignatrue: REFRESH_USER_TOKEN_SIGNATURE
            }
            break;
    }

    return signature;
}


const getSignature = async ({ tokenType = tokenTypeEnum.ACCESS, role = RoleEnum.USER } = {}) => {
    const { accessSignature, refreshSignatrue } = await gotTokenSignatures({ role });
    return tokenType === tokenTypeEnum.ACCESS ? accessSignature : refreshSignatrue;
}


export const deCodeToken = async ({
    authorization = "",
    tokenType = tokenTypeEnum.ACCESS,
    role = RoleEnum.USER
} = {}) => {

    const decoded = await jwt.decode(authorization);
    if (!decoded?.sub?.length) {
        throw BadException("invalid token");
    }
    if(decoded.exp * 1000 < Date.now()) {
        throw UnauthorizedException("Token expired");
    }
    const payload = await verifyToken({
        payload: authorization,
        secret: await getSignature({
            tokenType,
            role: decoded.aud[0]
        })
    });

    if (!payload?.sub) {
        throw BadException("missing token payload");
    }
    if (await exist({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
        throw UnauthorizedException("Expired Login Credentials")
    }


    const user = await findById({
        model: UserModel,
        id: payload.sub
    });
    if ((user.ChangeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
        throw UnauthorizedException("Expired Login Credentials")
    }
    if (!user) {
        throw NotfoundException("Invalid account");
    }

    return { user, payload };
}


export const createCredentials = async ({
    user,
    issuer = "",
    options = {},
}) => {
    const { accessSignature, refreshSignatrue } = await gotTokenSignatures({ role: user.role });
    const jwtid = randomUUID()
    const access_token = await createToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            issuer: issuer,
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRATION,
            jwtid
        },
    });


    const refresh_token = await createToken({
        payload: { sub: user._id },
        secret: refreshSignatrue,
        options: {
            ...options,
            issuer: issuer,
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRATION,
            jwtid
        },
    });



    return {
        access_token,
        refresh_token
    };
}

export const createRevokToken = async ({ payload }) => {
    const now = Math.ceil(Date.now() / 1000)
    const ttl = payload.iat + REFRESH_TOKEN_EXPIRATION - now

    await set({
        key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
        value: payload.iat,
        ttl
    })
    return;
}