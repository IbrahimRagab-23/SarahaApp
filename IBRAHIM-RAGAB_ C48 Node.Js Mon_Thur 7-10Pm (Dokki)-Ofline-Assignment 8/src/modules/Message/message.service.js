import { NotfoundException } from "../../common/exceptions/index.js"
import { createOne, deleteOne, find, findById, findOne, paginate } from "../../common/repository/index.js"
import { UserModel, MessageModel, IdentifyUser } from './../../DB/model/index.js';


export const createMessage = async ({ content, receiverId } = {}, files = [], user = undefined) => {
    const checkReceiverExist = await findById({
        model: UserModel,
        id: receiverId
    })
    if (!checkReceiverExist) {
        throw NotfoundException("Invalid Receiver Id")
    }
    const message = createOne({
        model: MessageModel,
        data: {
            receiverId,
            content,
            attachments: files.map(file => file.path),
            ...(user ? { senderId: user._id } : {})
        }
    })
    return message
}

export const getAllMessages = async ({ type, page, limit } = {}, user = undefined) => {

    let filter = {};
    if (type == "0") {
        filter = { receiverId: user._id }
    } else if (type == "1") {
        filter = { senderId: user._id }

    } else {
        filter: {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ]
        }
    }
    const data = await paginate({ model: MessageModel, page, limit, filter, options: { sort: { createdAt: -1 } } })
    return data
}

export const deleteMessage = async ({ messageId }, user = undefined) => {
    const data = await deleteOne({
        model: MessageModel,
        filter: { receiverId: user._id, _id: messageId }
    })
    if (!data.deletedCount) {
        throw NotfoundException("Invalid Message Id")
    }
    return data
}

export const getMessage = async ({ messageId }, user = undefined) => {
    const data = await findOne({
        model: MessageModel,
        filter: { receiverId: user._id, _id: messageId }
    })
    if (!data) {
        throw NotfoundException("Invalid Message Id")
    }
    return data
}


export const createRequestIdentity = async ({ messageId }, user = undefined) => {
    const findMessage = await findOne({
        model: MessageModel,
        filter: { _id: messageId, receiverId: user._id, senderId: { $exists: true } }
    })
    if (!findMessage) {
        throw NotfoundException("Invalid Message Id")
    }
    const checkRequestExist = await findOne({
        model: IdentifyUser,
        filter: { messageId }
    })
    if (checkRequestExist) {
        throw ConflictException("Request already sent")
    }
    const data = await createOne({
        model: IdentifyUser,
        data: {
            messageId,
            requesterId: user._id,
            targetId: findMessage.senderId
        }
    })
    return { requestId: data._id, messageId: data.messageId, status: data.status }
}