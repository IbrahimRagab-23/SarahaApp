import { EmailEnum } from "../../enum/index.js";
export const emailTemplate = ({
  title,
  message,
  code,
  note = "If you didn't request this, you can ignore this email.",
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    body { background-color: #88BDBF; margin: 0px; font-family: Arial, sans-serif; }
  </style>
</head>
<body style="margin:0px;">
  <table border="0" width="100%" cellpadding="0" cellspacing="0" style="background-color:#88BDBF;">
    <tr>
      <td align="center" style="padding:30px 15px;">

        <table border="0" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:500px;background-color:#F3F3F3;border:1px solid #cccccc;border-radius:8px;">
          <tr>
            <td align="center" style="padding:30px;">

              <h1 style="margin:0 0 10px 0;font-size:24px;color:#333333;">${title}</h1>
              <p style="margin:0 0 25px 0;font-size:15px;color:#666666;">${message}</p>

              <div style="display:inline-block;padding:15px 30px;background-color:#ffffff;border:2px dashed #88BDBF;border-radius:6px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#333333;">
                ${code}
              </div>

              <p style="margin:25px 0 0 0;font-size:13px;color:#999999;">${note}</p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const  verifyEmailTemplate = (code, title = "Confirm your email") =>
  emailTemplate({
    title,
    code,
    message: "Use the code below to confirm your email address.",
  });

export const forgetPasswordTemplate = (code, title = "Reset your password") =>
  emailTemplate({
    title,
    code,
    message: "Use the code below to reset your password. It expires soon, so use it right away.",
    note: "If you didn't ask to reset your password, ignore this email. Your password won't change.",
  });

const templates = {
  [EmailEnum.CONFIRM_EMAIL]: verifyEmailTemplate,
  [EmailEnum.FORGET_PASSWORD]: forgetPasswordTemplate,
};

export const emailTemplateBySubject = ({ subject, data }) => templates[subject](data.code);