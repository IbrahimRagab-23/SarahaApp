import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD ,APPLICATION_NAME} from "../../../config.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
      service: "gmail",    
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});
export const sendEmail=async ({
     to ,
    cc,
    bcc,
    subject ,
    text ,
    html ,
    attachment =[],
})=>{
try {
    if (!to.length && cc.length && bcc.length) {
        throw BadRequestException("Missing Email Recipients");
    }
    if (!html.length && text.length && attachment.length) {
        throw BadRequestException("Missing Email Content");
    }
  const info = await transporter.sendMail({
    from: `${APPLICATION_NAME} <${APP_EMAIL}>`, 
    to ,
    cc,
    bcc,
    subject ,
    text ,
    html ,
    attachment,
  });

} catch (err) {
  console.error("Error while sending mail:", err);
}
}