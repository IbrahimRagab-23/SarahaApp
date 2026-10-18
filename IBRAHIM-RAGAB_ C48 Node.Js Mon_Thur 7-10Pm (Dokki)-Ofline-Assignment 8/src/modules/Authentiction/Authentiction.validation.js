import { z } from "zod";
import { generalValidationFilds } from "../../common/validations.js";

export const loginSchema = (lang) => z.object({
    email: generalValidationFilds.email(lang),
    password: generalValidationFilds.password
});

export const login = (lang) => z.object({
    body: loginSchema(lang),
    query: z.strictObject({
        lang: z.enum(["en", "ar"]).optional()
    })
})

export const signup = (lang) => {
    return z.object({
        body: loginSchema(lang).extend({
            userName: generalValidationFilds.userName(lang),
            DOB: generalValidationFilds.DOB,
            gender: generalValidationFilds.gender,
            confirmPassword: generalValidationFilds.confirmPassword,
            phone: generalValidationFilds.phone(lang),
        }).superRefine((data, ctx) => {
            generalValidationFilds.matchFildes({ data, ctx, oraginal: "password", copy: "confirmPassword", lang })
        })
    })

}
export const signupWithGmail = (lang) => z.object({
    body: z.object({
        idToken: z.string().min(1)
    })
})

export const confirmEmail = (lang) => z.object({
    body: z.strictObject({
        email: generalValidationFilds.email(lang),
        otp: generalValidationFilds.otp(lang)
    })
})

export const resendConfirmEmail = (lang) => z.object({
    body: z.strictObject({
        email: generalValidationFilds.email(lang),
    })
})
     
export const resetForgotPassword = (lang) => z.object({
    body: z.strictObject({
        email: generalValidationFilds.email(lang),
        password: generalValidationFilds.password,
        otp: generalValidationFilds.otp(lang),
        confirmPassword: generalValidationFilds.confirmPassword,
    }).superRefine((data, ctx) => {
        generalValidationFilds.matchFildes({ data, ctx, oraginal: "password", copy: "confirmPassword", lang })
    })
})
