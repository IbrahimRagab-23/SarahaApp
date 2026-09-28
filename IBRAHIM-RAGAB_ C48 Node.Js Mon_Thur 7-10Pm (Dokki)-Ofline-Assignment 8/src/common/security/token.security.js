import jwt from 'jsonwebtoken';

import {
    ACCESS_ADMIN_TOKEN_SIGNTURE,
    ACCESS_TOKEN_EXPIRATION,
    ACCESS_USER_TOKEN_SIGNTURE,
    REFRESH_ADMIN_TOKEN_SIGNTURE,
    REFRESH_TOKEN_EXPIRATION,
    REFRESH_USER_TOKEN_SIGNTURE
} from './../../config.js';

import { BadException, NotfoundException } from '../exceptions/index.js';
import { findById } from '../reposittory/index.js';
import { UserModel } from './../../DB/model/index.js';
import { RoleEnum, tokenTypeEnum } from '../enum/index.js';


export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNTURE
} = {}) => {
    return jwt.sign(payload, secret, options);
}


export const verifyToken = async ({
    payload = {},
    secret = ACCESS_USER_TOKEN_SIGNTURE
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
                accessSignature: ACCESS_ADMIN_TOKEN_SIGNTURE,
                refreshSignatrue: REFRESH_ADMIN_TOKEN_SIGNTURE
            }
            break;

        default:
            signature = {
                accessSignature: ACCESS_USER_TOKEN_SIGNTURE,
                refreshSignatrue: REFRESH_USER_TOKEN_SIGNTURE
            }
            break;
    }

    return signature;
}


const getSignature = async ({tokenType = tokenTypeEnum.ACCESS, role = RoleEnum.USER} = {}) => {
    const {accessSignature, refreshSignatrue} = await gotTokenSignatures({ role });
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
    console.log(decoded);

    const payload = await verifyToken({
        payload: authorization,
        secret: await getSignature({
            tokenType,
            role:decoded.aud[0]
        })
    });

    if (!payload?.sub) {
        throw BadException("missing token payload");
    }

    console.log({ token: payload.sub });

    const user = await findById({
        model: UserModel,
        id: payload.sub
    });

    if (!user) {
        throw NotfoundException("Invalid account");
    }

    return { user, payload };
}


export const createCredentials = async ({
    user,
    options = {},
}) => {
    console.log(user._id, user.role);

    const {
        accessSignature,
        refreshSignatrue
    } = await gotTokenSignatures({ role: user.role });


    const access_token = await createToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRATION
        },
    });


    const refresh_token = await createToken({
        payload: { sub: user._id },
        secret: refreshSignatrue,
        options: {
            ...options,
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRATION,
        },
    });


    console.log(accessSignature, refreshSignatrue);

    return {
        access_token,
        refresh_token
    };
}