import mongoose from "mongoose";
import { z } from "zod"
import { generalValidationFilds } from "../../common/validations.js";

export const createMessage = (lang) => {
    return z.object({
        body: z.strictObject({
            content: z.string().min(4).max(50000).optional(),
            receiverId: generalValidationFilds.id(lang)
        }),
        files: z.array(generalValidationFilds.file(lang)).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "missing  message content"
            })
        }

    })
}
export const allMessages = (lang) => {
    return z.object({
        query: z.strictObject({
            type: z.enum(["0","1","2"]).default("0"),
            page:z.coerce.number().default(1),
            limit:z.coerce.number().default(5)
        })

    })
}
export const deleteMessage = (lang) => {
    return z.object({
        params: z.strictObject({
            messageId:generalValidationFilds.id(lang)
        })

    })
}