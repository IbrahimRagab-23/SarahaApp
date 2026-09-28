export const validation = (schema) => {
    return async (req, res, next) => {
        const validationResult = schema.safeParse(req.body)
        if (!validationResult.success) {
            return res.status(400).json({ errors: validationResult.error.issues })
        }
        req.validate = validationResult.data
        next()
    }
}