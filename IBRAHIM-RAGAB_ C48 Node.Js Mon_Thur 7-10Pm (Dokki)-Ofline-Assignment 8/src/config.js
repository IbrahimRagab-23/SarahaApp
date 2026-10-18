import {resolve} from 'node:path'
import { config } from 'dotenv';

config({
  path: resolve(`.env.${process.env.NODE_ENV ?? "development"}`)
});
export const PORT =parseInt(process.env.PORT)
export const APPLICATION_NAME = process.env.APPLICATION_NAME
export const APP_PASSWORD = process.env.APP_PASSWORD
export const APP_EMAIL = process.env.APP_EMAIL

export const DB_URI = process.env.DB_URI
export const ORIGINS = process.env.ORIGINS
export const REDIS_URI = process.env.REDIS_URI
export const SALT = parseInt(process.env.SALT)
export const ENC_KEY = process.env.ENC_KEY
export const IV_LENGTH = parseInt(process.env.IV_LENGTH)
export const ACCESS_ADMIN_TOKEN_SIGNATURE = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE
export const ACCESS_USER_TOKEN_SIGNATURE = process.env.ACCESS_USER_TOKEN_SIGNATURE
export const ACCESS_TOKEN_EXPIRATION = parseInt(process.env.ACCESS_TOKEN_EXPIRATION)

export const REFRESH_ADMIN_TOKEN_SIGNATURE = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE
export const REFRESH_USER_TOKEN_SIGNATURE = process.env.REFRESH_USER_TOKEN_SIGNATURE
export const REFRESH_TOKEN_EXPIRATION = parseInt(process.env.REFRESH_TOKEN_EXPIRATION)

export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID.split(',')
