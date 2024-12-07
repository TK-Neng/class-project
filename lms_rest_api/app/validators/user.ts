import vine from '@vinejs/vine'

const schema = vine.object({

})

export const registerUserValidator = vine.compile(schema)