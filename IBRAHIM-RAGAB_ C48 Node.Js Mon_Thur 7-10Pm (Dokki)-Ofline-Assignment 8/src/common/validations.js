import mongoose from "mongoose";
import { GenderEnum, LanguageEnum } from "./enum/index.js";
import { z } from "zod";
const validationMessage = {
    1: {
        ar: "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص",
        en: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    },
    2: {
        ar: "رقم الهاتف غير صحيح",
        en: "Invalid phone number"
    },
    3: {
        ar: "الاسم يجب أن يكون على الأقل حرفين",
        en: "Name must be at least 2 characters"
    }
}
const getValidationMessage = (lang, key) => {
    return lang == LanguageEnum.AR ?
        validationMessage[key].ar : validationMessage[key].en
}
const matchFildes = ({ data, ctx, oraginal, copy, lang }) => {

    if (data[oraginal] !== data[copy]) {
        ctx.addIssue({
            code: "custom",
            message: lang == LanguageEnum.AR ? `${oraginal} لا يتطابق مع ${copy}` : `${oraginal} don't match`,
            path: [copy]
        });
    }
}
export const generalValidationFilds = {
    matchFildes,
    email: (lang) => z.email("Invalid email format"),
    otp: (lang) => z.string().length(6, "OTP must be 6 characters long"),
    password: z.string().min(6).max(16)
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    userName: (lang) => z.string().min(2, getValidationMessage(lang, 3)),
    DOB: z.string().min(1, "Date of birth is required"),
    gender: z.enum(GenderEnum),
    confirmPassword: z.string().min(6).max(16),
    phone: (lang) => z.string().regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, getValidationMessage(lang, 2)),
    id: (lang) => z.string().refine((data) => { return mongoose.Types.ObjectId.isValid(data) }, { message: "invalid Id" }),
    file: (lang) => z.strictObject({
        fieldname: z.string(), originalname: z.string(), encoding: z.string(), mimetype: z.string(), buffer: z.instanceof(Buffer),
        size: z.number(), path: z.string(),
    }),


} 