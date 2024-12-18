import Book from "#models/book";
import Borrowing from "#models/borrowing";
import { HttpContext } from "@adonisjs/core/http";

export default class BorrowingsController {
    async index({ auth, response }: HttpContext) {
        const user = auth.getUserOrFail()
        try {
            let borrowings;
            if (user.role === 'ADMIN' || user.role === 'OWNER') {
                borrowings = await Borrowing.query()
                    .whereNull('return_date')
                    .preload('user') 
                    .preload('book')
                    .orderBy('due_date', 'asc')
            } else {
                borrowings = await Borrowing.query()
                    .where('user_id', user.user_id)
                    .preload('user')
                    .preload('book')
                    .orderBy('due_date', 'asc')
            }
            return response.ok(borrowings)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    async borrow({ auth, request, response }: HttpContext) {
        const user = auth.getUserOrFail()
        const { book_id, due_date } = request.only(['book_id', 'due_date']);
        try {
            const book = await Book.findOrFail(book_id)
            if (book.quantity < 1) {
                return response.badRequest('Book is not available for borrowing.')
            }

            const borrowing = await Borrowing.create({
                user_id: user.user_id,
                book_id: book_id,
                due_date: due_date,
                return_date: null
            })

            book.quantity -= 1
            await book.save()
            return response.created(borrowing)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}