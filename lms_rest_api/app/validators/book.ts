import vine from '@vinejs/vine'

const schema = vine.object({
    title: vine.string().minLength(3).maxLength(255)
        .regex(/^[a-zA-Z0-9\s\-':,.]+$/),
    description: vine.string().minLength(10).maxLength(1000),
    author: vine.string().minLength(2).maxLength(255)
        .regex(/^[a-zA-Z\s\-',.]+$/),
    genre: vine.string().minLength(1).maxLength(100),
    year_publication: vine.string()
        .regex(/^\d{4}$/)
        .transform((value) => {
            const year = parseInt(value)
            const currentYear = new Date().getFullYear()
            if (year < 1800 || year > currentYear) {
                throw new Error(`Year must be between 1800 and ${currentYear}`)
            }
            return value
        }),
    quantity: vine.number().min(0).max(999),
})

export const bookValidator = vine.compile(schema)