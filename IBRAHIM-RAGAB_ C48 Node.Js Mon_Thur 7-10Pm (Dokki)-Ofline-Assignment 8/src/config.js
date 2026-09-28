import {resolve} from 'node:path'
import { config } from 'dotenv';

config({
  path: resolve(`.env.${process.env.NODE_ENV ?? "development"}`)
});
export const PORT =parseInt(process.env.PORT)
export const DB_URI = process.env.DB_URI
export const SALT = parseInt(process.env.SALT)
export const ENC_KEY = process.env.ENC_KEY
export const IV_LENGTH = parseInt(process.env.IV_LENGTH)
export const ACCESS_ADMIN_TOKEN_SIGNTURE = process.env.ACCESS_ADMIN_TOKEN_SIGNTURE
export const ACCESS_USER_TOKEN_SIGNTURE = process.env.ACCESS_USER_TOKEN_SIGNTURE
export const ACCESS_TOKEN_EXPIRATION = parseInt(process.env.ACCESS_TOKEN_EXPIRATION)

export const REFRESH_ADMIN_TOKEN_SIGNTURE = process.env.REFRESH_ADMIN_TOKEN_SIGNTURE
export const REFRESH_USER_TOKEN_SIGNTURE = process.env.REFRESH_USER_TOKEN_SIGNTURE
export const REFRESH_TOKEN_EXPIRATION = parseInt(process.env.REFRESH_TOKEN_EXPIRATION)
