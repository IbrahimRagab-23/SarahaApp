import mongoose, { version } from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/enum/index.js";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true, minLength: 2, maxLength: 25, },
    lastName: { type: String, required: true, trim: true, minLength: 2, maxLength: 25, },
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    phone: { type: String, minLength: 11, },
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverimage: [String],
    gender: {
        type: Number,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE
    },
    role: {
        type: Number,
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || []
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName} ${this.lastName}`
})
export const UserModel = mongoose.model.User || mongoose.model("User", userSchema)