import vine from '@vinejs/vine'

const schema = vine.object({
    first_name: vine.string().minLength(3).maxLength(255),
    last_name: vine.string().minLength(3).maxLength(255),
    username: vine.string().minLength(3).maxLength(255).unique( async (db, value, field) => {
        const user = await db.from('users').where('username', value).first()
        return !user
    }),
    password: vine.string().minLength(6).confirmed(),
    email: vine.string().email().unique( async (db, value, field) => {
        const user = await db.from('users').where('email', value).first()
        return !user
    }),
    role: vine.enum(['ADMIN', 'USER']),
})

export const registerUserValidator = vine.compile(schema)