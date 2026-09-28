import { ConflictException, NotfoundException } from "../../common/exceptions/error.exeception.js";
import { createOne, findOne } from "../../common/reposittory/index.js";
import { compare, createCredentials, createToken, decryption, encryption, hash } from "../../common/security/index.js";
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, REFRESH_USER_TOKEN_SIGNTURE} from "../../config.js";
import { UserModel } from "../../DB/model/User.model.js";

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
    return user;
};

export const login = async ({ email, password }) => {

    const user = await findOne({
        model: UserModel,
        filter: { email }
    });

    if (!user) {
        throw NotfoundException("Invalid email or password");
    }
    const match = await compare(password, user.password)

    if (!match) { throw NotfoundException("Invalid email or password") }
    user.phone = await decryption(user.phone)
 return await createCredentials({ user })

};
