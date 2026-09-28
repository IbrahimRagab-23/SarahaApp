import bcrypt from  "bcrypt"

export const hash = async (plainText , round=12 ,minor="b")=>{
const salt = await bcrypt.genSalt(round, minor )
return await bcrypt.hash(plainText, salt)
}

export const  compare =async ( plainText, cipherText)=>{
return await bcrypt.compare(plainText, cipherText)
}