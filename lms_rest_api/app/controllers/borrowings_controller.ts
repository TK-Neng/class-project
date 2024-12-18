// import type { HttpContext } from '@adonisjs/core/http'

import Borrowing from "#models/borrowing";
import { HttpContext } from "@adonisjs/core/http";

export default class BorrowingsController {
    async index({ auth, response }: HttpContext) {
        const user = auth.getUserOrFail()
        try {
            if (user.role === 'ADMIN' || user.role === 'OWNER') {
                const borrowings = await Borrowing.query()
                    .preload('user')
                    .preload('book')
                    .orderBy('borrow_date', 'desc')
                return response.ok(borrowings)
            } else {
                const borrowings = await Borrowing.query()
                    .where('user_id', user.user_id)
                    .preload('user')
                    .preload('book')
                    .orderBy('borrow_date', 'desc')
                return response.ok(borrowings)
            }
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}