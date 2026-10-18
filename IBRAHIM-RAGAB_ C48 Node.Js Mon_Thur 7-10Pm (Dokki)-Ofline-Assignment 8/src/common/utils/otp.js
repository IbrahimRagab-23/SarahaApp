import { EmailEnum } from "../enum/index.js";
import { hash } from "../security/index.js";
import { set } from "../services/index.js";

export const CreateOtp = () => {
return Math.floor( Math.random() * 900000 + 100000 );
}
export const  otpKey = (input, subject = EmailEnum.CONFIRM_EMAIL) =>{
        
   return `User::${input}::${subject}::otp`

}
export const  otpTrailKey = (input, subject = EmailEnum.CONFIRM_EMAIL) =>{
        
   return `${otpKey(input, subject)}::trail`

}

export const hashOtp= async ({input , otpCode , subject})=>{
    await set({
                key : otpKey(input, subject) ,
                value:await hash(otpCode.toString()) ,
                ttl:120
            })
}