// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import Book from '#models/book'
export default class BooksController {

    async index({ auth, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const books = await Book.query()
            return response.ok(books)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}