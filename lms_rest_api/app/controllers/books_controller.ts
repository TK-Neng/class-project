// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import Book from '#models/book'
export default class BooksController {

    async index({ auth, response, request }: HttpContext) {
        const page = request.input('page', 1); // Default page 1
        const perPage = request.input('perPage', 8); // Default 10 items per page
        try {
            const user = auth.getUserOrFail()
            const books = await Book.query().orderBy('genre', 'asc').paginate(page, perPage)
            return response.ok(books)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}