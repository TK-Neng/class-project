import vine from '@vinejs/vine'

const schema = vine.object({
  name: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(50)
    .regex(/^[A-Z]/)
})

export const genreValidator = vine.compile(schema)