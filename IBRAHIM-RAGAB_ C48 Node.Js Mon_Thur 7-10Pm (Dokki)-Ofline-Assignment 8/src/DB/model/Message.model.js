import mongoose, { version } from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: function () {
            this.attachments?.length > 0 ? false : true
        },
        minLength: 2, maxLength: 50000,
    },
    attachments: [String],
    senderId: { type: mongoose.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

export const MessageModel = mongoose.model.message || mongoose.model("message", messageSchema)