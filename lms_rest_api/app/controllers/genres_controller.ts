// import type { HttpContext } from '@adonisjs/core/http'
import Genre from '#models/genre'
export default class GenresController {
    async index({ auth, response }) {
        try {
            const user = auth.getUserOrFail()
            const genres = await Genre.query().orderBy('name', 'asc')
            return response.ok(genres)
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }
}