import { logoutEnum } from "../../common/enum/security.enum.js";
import { ConflictException } from "../../common/exceptions/index.js";
import { findByIdAndUpdate } from "../../common/repository/index.js"
import { createCredentials, createRevokToken, createToken, userBaseRevokeTokenKey, } from "../../common/security/index.js";
import { ACCESS_TOKEN_EXPIRATION } from "../../config.js";
import { UserModel } from './../../DB/model/index.js';
import { del, get, keys, set } from './../../common/services/index.js';

const userKeyCached = ({ user }) => {
  return `UserProfil::${user.id}::CachedProfil`
}

const getCached = async ({ user }) => {
  return await get({ key: userKeyCached({ user }) })
}

export const chickGetCachedUser = async ({ user }) => {
  const cached = await getCached({ user })
  if (cached) {
    return cached
  }
  await set({ key: userKeyCached({ user }), value: user })
  return user
}

export const chickDeleteCachedUser = async ({ user }) => {
  await del({ key: userKeyCached({ user }) })
  return user
}
export const profile = async (user) => {
  return await chickGetCachedUser({ user: user })
}
export const updateProfile = async (userId, updates) => {
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: userId._id,
    update: updates
  })
  await chickDeleteCachedUser({ user: userId })
  return user
}

export const rotateToken = async (payload, user, issuer) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRATION) * 1000
  const marginTime = 5 * 60 * 1000;
  const currentTime = Date.now()
  if (currentTime + marginTime < accessExpiresIn) {
    throw ConflictException("Access token still has plenty of time left, cannot rotate yet");
  }
  const data = await createCredentials({ user, issuer })
  await createRevokToken({ payload })
  return data
}

export const logout = async (payload, user, { action = logoutEnum.ONE }) => {

  switch (action) {
    case logoutEnum.ALL:
      user.ChangeCredentialsTime = new Date()
      await user.save()
      await del({ key: await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) })
      break;
    default:
      return await createRevokToken({ payload })
      break;
  }

} 