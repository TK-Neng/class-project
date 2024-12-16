import vine from '@vinejs/vine'

const schema = vine.object({
    first_name: vine.string().minLength(3).maxLength(255),
    last_name: vine.string().minLength(3).maxLength(255),
    username: vine.string().minLength(3).maxLength(255).unique(async (db, value, field) => {
        const user = await db.from('users').where('username', value).first()
        return !user
    }),
    password: vine.string().minLength(6).confirmed(),
    email: vine.string().email().unique(async (db, value, field) => {
        const user = await db.from('users').where('email', value).first()
        return !user
    }),
    phone_number: vine.string()
        .regex(/^[0-9+\-\s()]*$/) // Allows digits, +, -, spaces, parentheses
        .nullable() // Makes it optional
        .optional(),
    
})

export const registerUserValidator = vine.compile(schema)

const updateProfileSchema = vine.object({
  first_name: vine.string().trim().minLength(2).maxLength(50),
  last_name: vine.string().trim().minLength(2).maxLength(50),
  email: vine.string().email(),
  phone_number: vine.string().trim()
    .regex(/^[0-9]{10}$/)
    .nullable() // อนุญาตให้เป็น null ได้
    .optional() // ไม่จำเป็นต้องส่งมา
})

export const updateProfileValidator = vine.compile(updateProfileSchema)