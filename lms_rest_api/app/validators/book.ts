import vine from '@vinejs/vine'

const schema = vine.object({
    title: vine.string().minLength(1).maxLength(255),
    description: vine.string().minLength(1).maxLength(1000),
    author: vine.string().minLength(1).maxLength(255),
    genre: vine.string().minLength(1).maxLength(100),
    year_publication: vine.string().regex(/^\d{4}$/), // Validates YYYY format
    quantity: vine.number().min(0),
})

export const bookValidator = vine.compile(schema)