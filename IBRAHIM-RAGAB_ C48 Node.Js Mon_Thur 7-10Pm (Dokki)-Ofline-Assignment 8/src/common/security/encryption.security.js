import crypto from "node:crypto"
import { ENC_KEY, IV_LENGTH } from "../../config.js"

export const encryption = async (plainText) => {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipherIv = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv)
    let cipherText = cipherIv.update(plainText, "utf-8", "hex")
    cipherText += cipherIv.final("hex")
    const finalCipher = `${iv.toString("hex")}::${cipherText}`

    return finalCipher
}

export const decryption = async (cipherText) => {
    const [hexIv , encryption] =cipherText.split("::")
    const iv = Buffer.from(hexIv,"hex")
    const cipherIv = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, iv)
    let plainText = cipherIv.update(encryption , "hex" , "utf-8")
    const finalPlainText =  plainText += cipherIv.final("utf-8")
    return finalPlainText
}