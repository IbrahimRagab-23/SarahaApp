import { ProviderEnum } from "../../common/enum/user.enum.js";
import { EmailEnum } from "../../common/enum/email.enum.js";
import { ConflictException, NotfoundException, BadException, ToManyRequestsException } from "../../common/exceptions/index.js";
import { createOne, findOne } from "../../common/repository/index.js";
import { compare, createCredentials, createToken, decryption, encryption, hash, userBaseRevokeTokenKey } from "../../common/security/index.js";
import { set, get, del, ttl, incrBy, expire, keys } from "../../common/services/index.js";
import { emailEvent } from "../../common/utils/email/index.js";
import { CreateOtp, hashOtp, otpKey, otpTrailKey } from "../../common/utils/index.js";
import { formatDuration } from "../../common/utils/time.format.js";
import { WEB_CLIENT_ID } from "../../config.js";
import { UserModel } from "../../DB/model/User.model.js";
import { OAuth2Client } from 'google-auth-library'

const sendEmailOtp = async ({ inputs, subject = EmailEnum.CONFIRM_EMAIL, MaxTrail = 3, blockInSecond = 300, title }) => {
    const existOtpTtl = await ttl({ key: otpKey(inputs.email, subject) })

    if (existOtpTtl > 0) {
        throw ConflictException(`You can request a new OTP after ${existOtpTtl} seconds`)
    };
    const oldTrail = await get({ key: otpTrailKey(inputs.email, subject) }) ?? 0
    if (oldTrail >= MaxTrail) {
        throw ToManyRequestsException(
            `You have exceeded the maximum number of OTP requests. Please try again in ${formatDuration(blockInSecond)} 🥲`
        )
    }
    const otpCode = CreateOtp()
    await hashOtp({ input: inputs.email, otpCode, subject })
    const current = await incrBy({ key: otpTrailKey(inputs.email, subject) })
    if (current == MaxTrail) {
        await expire({ key: otpTrailKey(inputs.email, subject), ttl: blockInSecond })
    }
    const otpTarilTtl = await ttl({ key: otpTrailKey(inputs.email, subject) })
    emailEvent.emit("sendEmail", {
        recipients: { to: inputs.email },
        subject,
        data: { code: otpCode, title: title ?? subject }
    })
}
const client = new OAuth2Client();
async function verifyAccountGoogle(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload()
    return payload;
}


export const signupWithGmail = async ({ idToken }, issuer) => {
    const { email, email_verified, name, picture } = await verifyAccountGoogle(idToken)
    if (!email_verified) {
        throw BadException("email not verified by Google")
    }

    const existAccount = await findOne({ model: UserModel, filter: { email } })
    if (existAccount) {
        if (existAccount.provider !== ProviderEnum.GOOGLE) {
            throw ConflictException("invalid account provider")
        }
        return { status: 200, data: await createCredentials({ user: existAccount, issuer }) }
    }

    const user = await createOne({
        model: UserModel,
        data: {
            userName: name?.includes(" ") ? name : `${name} User`,
            email,
            confirmEmail: new Date(),
            provider: ProviderEnum.GOOGLE,
            image: picture
        }
    })
    return { status: 201, data: await createCredentials({ user, issuer }) }
}

export const signup = async (inputs) => {

    const duplicateAccount = await findOne({
        model: UserModel,
        filter: { email: inputs.email },
        options: { select: { email: 1 } }
    });

    if (duplicateAccount) {
        throw ConflictException("email already exists");
    }
    const hashedPassword = await hash(inputs.password)
    const hashedPhone = await encryption(inputs.phone)
    const user = await createOne({
        model: UserModel,
        data: { ...inputs, password: hashedPassword, phone: hashedPhone }
    });
    await sendEmailOtp({ inputs })
    return user;
};


export const confirmEmail = async (inputs) => {

    const account = await findOne({
        model: UserModel,
        filter: { email: inputs.email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
    });
    if (!account) throw NotfoundException("Invalid email or account already confirmed");
    const hashedOtp = await get({ key: otpKey(inputs.email) })
    if (!hashedOtp || !(await compare(inputs.otp.toString(), hashedOtp))) {
        throw ConflictException("Invalid or expired OTP code");
    }
    account.confirmEmail = new Date();
    await account.save();
    await del({ key: await keys({ prefix: otpKey(inputs.email) }) })
    return account;

};


export const resendConfirmEmail = async (inputs) => {
    const account = await findOne({
        model: UserModel,
        filter: { email: inputs.email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
    });
    if (!account) throw NotfoundException("Invalid email or account already confirmed");
    await sendEmailOtp({ inputs })
    return account;

};


export const verifyForgotPassword = async (inputs) => {

    const account = await findOne({
        model: UserModel,
        filter: { email: inputs.email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
    });

    if (!account) throw NotfoundException("Invalid email or account already confirmed");

    const hashedOtp = await get({ key: otpKey(inputs.email, EmailEnum.FORGET_PASSWORD) })

    if (!hashedOtp || !(await compare(inputs.otp.toString(), hashedOtp))) {
        throw ConflictException("Invalid or expired OTP code");
    }
    return account;

};


export const resetForgotPassword = async (inputs) => {
    const account = await verifyForgotPassword(inputs)
    account.password = await hash(inputs.password)
    account.changeCredentianlsTime = new Date()
    await account.save()
    const result = await Promise.all([
        keys({ prefix: otpKey(inputs.email, EmailEnum.FORGET_PASSWORD) }),
        keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) })
    ])
    await del({ key: [...result[0], ...result[1]] })
    return;

};


export const requestForgotPassword = async (inputs) => {
    const account = await findOne({
        model: UserModel,
        filter: { email: inputs.email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
    });
    if (!account) throw NotfoundException("Invalid email or account already confirmed");
    await sendEmailOtp({ inputs, subject: EmailEnum.FORGET_PASSWORD })
    return account;

};

export const login = async (inputs, issuer) => {

    const user = await findOne({
        model: UserModel,
        filter: { email: inputs.email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
    });

    if (!user) {
        throw NotfoundException("Invalid email or password");
    }
    const match = await compare(inputs.password, user.password)

    if (!match) { throw NotfoundException("Invalid email or password") }
    user.phone = await decryption(user.phone)
    return await createCredentials({ user, issuer });

};