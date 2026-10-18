export const successResponse =({res , message="Done" ,data = undefined  ,statusCode = 200}={}) => {

    return res.status(statusCode).json({ message , statusCode , data})
}