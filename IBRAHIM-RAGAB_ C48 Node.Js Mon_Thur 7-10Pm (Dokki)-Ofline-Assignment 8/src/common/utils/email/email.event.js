import { EventEmitter } from "node:events"
import { sendEmail } from "./send.email.js"
import { emailTemplateBySubject } from "./email.templates.js";
export const emailEvent = new EventEmitter()
emailEvent.on("sendEmail", async ({ recipients, subject, data }) => {
    
    await sendEmail({
        ...recipients,
        subject: subject.replaceAll("_", " "),
        html: emailTemplateBySubject({ subject, data })    })
})