import { ConflictException } from "../../common/exceptions/error.exeception.js";
import { findByIdAndUpdate } from "../../common/reposittory/index.js"
import { createCredentials, createToken } from "../../common/security/index.js";
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, REFRESH_USER_TOKEN_SIGNTURE } from "../../config.js";
import { UserModel } from './../../DB/model/index.js';

export const profile = async (user) => {

  return user
}
export const updateProfile = async (userId, updates) => {
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: userId._id,
    update: updates

  })
  return user
}

export const rotateToken = async (payload) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRATION) * 1000
  const marginTime = 5 * 60 * 1000;
  const currentTime = Date.now() 
if (currentTime + marginTime < accessExpiresIn) {
          throw ConflictException("Access token still has plenty of time left, cannot rotate yet");
     }
     return await createCredentials({ payload: { sub: payload.sub } })
} 