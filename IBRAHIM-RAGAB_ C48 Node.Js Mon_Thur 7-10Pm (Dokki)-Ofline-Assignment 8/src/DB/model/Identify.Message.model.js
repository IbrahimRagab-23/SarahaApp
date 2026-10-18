import mongoose, { version } from "mongoose";
import { IdentityStatusEnum } from "../../common/enum/index.js";

const identifySchema = new mongoose.Schema({
    messageId: { type: mongoose.Types.ObjectId, ref: "message", required: true, unique: true },
    requesterId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    targetId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    status: { type: Number, enum: Object.values(IdentityStatusEnum), default: IdentityStatusEnum.PENDING }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

export const IdentifyUser = mongoose.model.identify || mongoose.model("identify", identifySchema)